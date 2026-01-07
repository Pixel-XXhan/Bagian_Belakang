import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    CreateModulAjarDto,
    UpdateModulAjarDto,
    GenerateModulAjarDto,
    ModulAjarQueryDto,
} from './dto/modul-ajar.dto';

@Injectable()
export class ModulAjarService {
    private readonly logger = new Logger(ModulAjarService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    async findAll(userId: string, query?: ModulAjarQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('modul_ajar')
            .select(`*, rpp:rpp_id(id, judul)`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (query?.rpp_id) dbQuery = dbQuery.eq('rpp_id', query.rpp_id);
        if (query?.search) dbQuery = dbQuery.ilike('judul', `%${query.search}%`);
        if (query?.limit) dbQuery = dbQuery.limit(query.limit);
        if (query?.offset) dbQuery = dbQuery.range(query.offset, query.offset + (query.limit || 10) - 1);

        const { data, error } = await dbQuery;
        if (error) throw error;
        return data;
    }

    async findOne(id: string, userId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('modul_ajar')
            .select(`*, rpp:rpp_id(id, judul, kelas, materi_pokok)`)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`Modul Ajar dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async create(userId: string, dto: CreateModulAjarDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('modul_ajar')
            .insert({ user_id: userId, ...dto })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, userId: string, dto: UpdateModulAjarDto) {
        await this.findOne(id, userId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('modul_ajar')
            .update({ ...dto, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async remove(id: string, userId: string) {
        await this.findOne(id, userId);

        const { error } = await this.supabaseService
            .getClient()
            .from('modul_ajar')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        return { message: 'Modul Ajar berhasil dihapus' };
    }

    async generate(userId: string, dto: GenerateModulAjarDto) {
        const systemInstruction = `Kamu adalah asisten guru profesional Indonesia yang ahli membuat Modul Ajar sesuai Kurikulum Merdeka.

Buat Modul Ajar lengkap dengan komponen:
1. Informasi Umum:
   - Identitas modul
   - Kompetensi awal
   - Profil Pelajar Pancasila
   - Sarana dan prasarana
   - Target peserta didik
   - Model pembelajaran
2. Komponen Inti:
   - Tujuan pembelajaran
   - Pemahaman bermakna
   - Pertanyaan pemantik
   - Kegiatan pembelajaran (pendahuluan, inti, penutup)
   - Asesmen
   - Pengayaan dan remediasi
3. Lampiran:
   - LKPD
   - Bahan bacaan guru dan siswa
   - Glosarium
   - Daftar pustaka

Output dalam format JSON.`;

        const prompt = `Buatkan Modul Ajar untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}
- Fase: ${dto.fase || 'E'}
- Alokasi Waktu: ${dto.alokasi_waktu || 90} menit`;

        const response = await this.geminiService.chat({
            model: (dto.model || 'gemini-2.5-flash') as 'gemini-2.5-flash',
            messages: [{ role: 'user', content: prompt }],
            systemInstruction,
            responseFormat: { type: 'json_object' },
        });

        let konten: Record<string, any> = {};
        try {
            konten = JSON.parse(response.content);
        } catch {
            konten = { raw_content: response.content };
        }

        const modulData = {
            judul: dto.topik,
            profil_pelajar_pancasila: konten.profil_pelajar_pancasila || [],
            sarana_prasarana: konten.sarana_prasarana || [],
            target_peserta_didik: konten.target_peserta_didik || dto.kelas,
            model_pembelajaran: konten.model_pembelajaran || '',
            konten,
        };

        if (dto.save_to_db !== false) {
            const saved = await this.create(userId, modulData);
            return { ...saved, ai_response: { model: response.model, usage: response.usage } };
        }

        return { ...modulData, ai_response: { model: response.model, usage: response.usage } };
    }

    async *generateStream(userId: string, dto: GenerateModulAjarDto): AsyncGenerator<string> {
        const systemInstruction = `Kamu adalah asisten guru profesional Indonesia. Buat Modul Ajar lengkap dalam format markdown.`;

        const prompt = `Buatkan Modul Ajar untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}
- Fase: ${dto.fase || 'E'}`;

        const generator = this.geminiService.chatStream({
            model: (dto.model || 'gemini-2.5-flash') as 'gemini-2.5-flash',
            messages: [{ role: 'user', content: prompt }],
            systemInstruction,
        });

        for await (const chunk of generator) {
            yield chunk;
        }
    }
}
