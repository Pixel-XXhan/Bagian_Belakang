import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    CreateAtpDto,
    UpdateAtpDto,
    GenerateAtpDto,
    AtpQueryDto,
} from './dto/atp.dto';

@Injectable()
export class AtpService {
    private readonly logger = new Logger(AtpService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    async findAll(userId: string, query?: AtpQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('atp')
            .select(`*, mapel:mapel_id(id, nama), cp:cp_id(id, elemen)`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (query?.mapel_id) dbQuery = dbQuery.eq('mapel_id', query.mapel_id);
        if (query?.fase) dbQuery = dbQuery.eq('fase', query.fase);
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
            .from('atp')
            .select(`*, mapel:mapel_id(id, nama, kode), cp:cp_id(*)`)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`ATP dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async create(userId: string, dto: CreateAtpDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('atp')
            .insert({ user_id: userId, ...dto })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, userId: string, dto: UpdateAtpDto) {
        await this.findOne(id, userId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('atp')
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
            .from('atp')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        return { message: 'ATP berhasil dihapus' };
    }

    async generate(userId: string, dto: GenerateAtpDto) {
        const systemInstruction = `Kamu adalah ahli kurikulum Indonesia yang menguasai Kurikulum Merdeka.

Buatkan Alur Tujuan Pembelajaran (ATP) lengkap dengan komponen:
1. Capaian Pembelajaran (CP) per fase
2. Elemen dan sub-elemen
3. Tujuan Pembelajaran (TP) yang terurut dan terukur
4. Alokasi waktu per TP
5. Indikator ketercapaian
6. Asesmen yang sesuai untuk setiap TP

ATP harus:
- Mengacu pada CP yang ditetapkan
- Memiliki urutan yang logis dan terstruktur
- Mempertimbangkan karakteristik peserta didik
- Dapat diukur ketercapaiannya

Output dalam format JSON.`;

        const prompt = `Buatkan ATP untuk:
- Mata Pelajaran: ${dto.mapel}
- Fase: ${dto.fase}
- Kelas: ${dto.kelas || 'Sesuai fase'}
- Elemen fokus: ${dto.elemen || 'Semua elemen'}
- Jumlah minggu: ${dto.jumlah_minggu || 16}`;

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

        const atpData = {
            judul: `ATP ${dto.mapel} - Fase ${dto.fase}`,
            fase: dto.fase,
            kelas: dto.kelas,
            tujuan_pembelajaran: konten.tujuan_pembelajaran || {},
            konten,
        };

        if (dto.save_to_db !== false) {
            const saved = await this.create(userId, atpData);
            return { ...saved, ai_response: { model: response.model, usage: response.usage } };
        }

        return { ...atpData, ai_response: { model: response.model, usage: response.usage } };
    }
}
