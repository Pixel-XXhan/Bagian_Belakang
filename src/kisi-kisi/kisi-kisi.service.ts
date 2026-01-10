import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    CreateKisiKisiDto,
    UpdateKisiKisiDto,
    GenerateKisiKisiDto,
    KisiKisiQueryDto,
} from './dto/kisi-kisi.dto';

@Injectable()
export class KisiKisiService {
    private readonly logger = new Logger(KisiKisiService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    async findAll(userId: string, query?: KisiKisiQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('kisi_kisi')
            .select(`*, mapel:mapel_id(id, nama)`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (query?.mapel_id) dbQuery = dbQuery.eq('mapel_id', query.mapel_id);
        if (query?.jenis_ujian) dbQuery = dbQuery.eq('jenis_ujian', query.jenis_ujian);
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
            .from('kisi_kisi')
            .select(`*, mapel:mapel_id(id, nama, kode)`)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`Kisi-kisi dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async create(userId: string, dto: CreateKisiKisiDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('kisi_kisi')
            .insert({ user_id: userId, ...dto })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, userId: string, dto: UpdateKisiKisiDto) {
        await this.findOne(id, userId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('kisi_kisi')
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
            .from('kisi_kisi')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        return { message: 'Kisi-kisi berhasil dihapus' };
    }

    async generate(userId: string, dto: GenerateKisiKisiDto) {
        const systemInstruction = `Kamu adalah guru profesional Indonesia yang ahli membuat Kisi-Kisi Soal.

Buatkan kisi-kisi soal lengkap dengan format tabel yang mencakup:
1. Kompetensi Dasar (KD)
2. Materi
3. Indikator Soal
4. Level Kognitif (C1-C6 taksonomi Bloom)
5. Bentuk Soal (PG/Essay/Isian)
6. Nomor Soal

Pastikan distribusi level kognitif seimbang:
- C1-C2 (Mengingat, Memahami): 30%
- C3-C4 (Menerapkan, Menganalisis): 50%
- C5-C6 (Mengevaluasi, Mencipta): 20%

Output dalam format JSON.`;

        const prompt = `Buatkan kisi-kisi soal untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik/Materi: ${dto.topik}
- Kelas: ${dto.kelas}
- Jenis Ujian: ${dto.jenis_ujian || 'Ulangan Harian'}
- Jumlah Soal: ${dto.jumlah_soal || 20}`;

        const response = await this.geminiService.chat({
            model: (dto.model || 'gemini-1.5-flash') as any,
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

        const kisiKisiData = {
            judul: `Kisi-Kisi ${dto.jenis_ujian || 'UH'} - ${dto.topik}`,
            kelas: dto.kelas,
            jenis_ujian: dto.jenis_ujian || 'Ulangan Harian',
            kompetensi_dasar: konten.kompetensi_dasar || [],
            indikator_soal: konten.indikator_soal || konten.kisi_kisi || {},
            konten,
        };

        if (dto.save_to_db !== false) {
            const saved = await this.create(userId, kisiKisiData);
            return { ...saved, ai_response: { model: response.model, usage: response.usage } };
        }

        return { ...kisiKisiData, ai_response: { model: response.model, usage: response.usage } };
    }
}
