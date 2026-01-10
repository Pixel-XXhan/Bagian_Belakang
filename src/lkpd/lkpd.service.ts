import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    CreateLkpdDto,
    UpdateLkpdDto,
    GenerateLkpdDto,
    LkpdQueryDto,
} from './dto/lkpd.dto';

@Injectable()
export class LkpdService {
    private readonly logger = new Logger(LkpdService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    async findAll(userId: string, query?: LkpdQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('lkpd')
            .select(`*, mapel:mapel_id(id, nama)`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (query?.mapel_id) dbQuery = dbQuery.eq('mapel_id', query.mapel_id);
        if (query?.kelas) dbQuery = dbQuery.eq('kelas', query.kelas);
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
            .from('lkpd')
            .select(`*, mapel:mapel_id(id, nama, kode)`)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`LKPD dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async create(userId: string, dto: CreateLkpdDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('lkpd')
            .insert({ user_id: userId, ...dto })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, userId: string, dto: UpdateLkpdDto) {
        await this.findOne(id, userId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('lkpd')
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
            .from('lkpd')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        return { message: 'LKPD berhasil dihapus' };
    }

    async generate(userId: string, dto: GenerateLkpdDto) {
        const systemInstruction = `Kamu adalah guru profesional Indonesia yang ahli membuat LKPD (Lembar Kerja Peserta Didik) sesuai Kurikulum Merdeka.

Buat LKPD lengkap dengan komponen:
1. Identitas LKPD (judul, mapel, kelas)
2. Kompetensi Dasar
3. Tujuan Pembelajaran
4. Petunjuk Pengerjaan
5. Alat dan Bahan (jika diperlukan)
6. Langkah-langkah Kegiatan
7. Lembar Kerja (tabel, grafik, tempat jawaban)
8. Pertanyaan Pengarah
9. Kesimpulan
10. Refleksi

Output dalam format JSON.`;

        const prompt = `Buatkan LKPD untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}
- Jenis Kegiatan: ${dto.jenis_kegiatan || 'Individu'}
- Durasi: ${dto.durasi || 45} menit`;

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

        const lkpdData = {
            judul: `LKPD - ${dto.topik}`,
            kelas: dto.kelas,
            kompetensi_dasar: konten.kompetensi_dasar || '',
            tujuan_pembelajaran: konten.tujuan_pembelajaran || [],
            petunjuk: konten.petunjuk || '',
            langkah_kegiatan: konten.langkah_kegiatan || [],
            soal: konten.pertanyaan || konten.soal || {},
            konten,
        };

        if (dto.save_to_db !== false) {
            const saved = await this.create(userId, lkpdData);
            return { ...saved, ai_response: { model: response.model, usage: response.usage } };
        }

        return { ...lkpdData, ai_response: { model: response.model, usage: response.usage } };
    }
}
