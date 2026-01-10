import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    CreateBahanAjarDto,
    UpdateBahanAjarDto,
    GenerateBahanAjarDto,
    BahanAjarQueryDto,
    JenisBahanAjar,
} from './dto/bahan-ajar.dto';

@Injectable()
export class BahanAjarService {
    private readonly logger = new Logger(BahanAjarService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    async findAll(userId: string, query?: BahanAjarQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('bahan_ajar')
            .select(`*, mapel:mapel_id(id, nama)`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (query?.mapel_id) dbQuery = dbQuery.eq('mapel_id', query.mapel_id);
        if (query?.jenis) dbQuery = dbQuery.eq('jenis', query.jenis);
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
            .from('bahan_ajar')
            .select(`*, mapel:mapel_id(id, nama, kode)`)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`Bahan Ajar dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async create(userId: string, dto: CreateBahanAjarDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('bahan_ajar')
            .insert({ user_id: userId, ...dto })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, userId: string, dto: UpdateBahanAjarDto) {
        await this.findOne(id, userId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('bahan_ajar')
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
            .from('bahan_ajar')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        return { message: 'Bahan Ajar berhasil dihapus' };
    }

    async generate(userId: string, dto: GenerateBahanAjarDto) {
        const jenis = dto.jenis || JenisBahanAjar.HANDOUT;

        const jenisDescription = {
            [JenisBahanAjar.HANDOUT]: 'ringkasan materi singkat untuk dibagikan ke siswa',
            [JenisBahanAjar.BUKU]: 'bab buku pelajaran lengkap',
            [JenisBahanAjar.MODUL]: 'modul pembelajaran mandiri',
            [JenisBahanAjar.BROSUR]: 'brosur informatif singkat',
            [JenisBahanAjar.LEMBAR_INFO]: 'lembar informasi satu halaman',
            [JenisBahanAjar.POSTER]: 'konten untuk poster pembelajaran',
            [JenisBahanAjar.INFOGRAFIS]: 'konten untuk infografis visual',
        };

        const systemInstruction = `Kamu adalah guru profesional Indonesia yang ahli membuat bahan ajar.

Buatkan ${jenisDescription[jenis]} dengan struktur yang sesuai:
1. Judul yang menarik
2. Pendahuluan/Pengantar
3. Konten utama (sesuai jenis)
4. Kesimpulan/Rangkuman
5. Referensi (jika diperlukan)

Pastikan:
- Bahasa mudah dipahami sesuai tingkat siswa
- Konten akurat dan up-to-date
- Visual-friendly (jika poster/infografis, deskripsikan elemen visual)

Output dalam format JSON.`;

        const prompt = `Buatkan ${jenis} untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}`;

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

        const bahanAjarData = {
            judul: konten.judul || `${jenis} - ${dto.topik}`,
            jenis,
            kelas: dto.kelas,
            deskripsi: konten.deskripsi || konten.pendahuluan || '',
            tujuan: konten.tujuan || '',
            konten_text: konten.konten_utama || konten.isi || '',
            konten,
        };

        if (dto.save_to_db !== false) {
            const saved = await this.create(userId, bahanAjarData);
            return { ...saved, ai_response: { model: response.model, usage: response.usage } };
        }

        return { ...bahanAjarData, ai_response: { model: response.model, usage: response.usage } };
    }
}
