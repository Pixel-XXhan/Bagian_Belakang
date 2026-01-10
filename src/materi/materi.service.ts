import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    CreateMateriDto,
    UpdateMateriDto,
    GenerateMateriDto,
    MateriQueryDto,
} from './dto/materi.dto';

@Injectable()
export class MateriService {
    private readonly logger = new Logger(MateriService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    async findAll(userId: string, query?: MateriQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('materi_pembelajaran')
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
            .from('materi_pembelajaran')
            .select(`*, mapel:mapel_id(id, nama, kode)`)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`Materi dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async create(userId: string, dto: CreateMateriDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('materi_pembelajaran')
            .insert({ user_id: userId, ...dto })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, userId: string, dto: UpdateMateriDto) {
        await this.findOne(id, userId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('materi_pembelajaran')
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
            .from('materi_pembelajaran')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        return { message: 'Materi berhasil dihapus' };
    }

    async generate(userId: string, dto: GenerateMateriDto) {
        const tingkat = dto.tingkat || 'menengah';
        const format = dto.format || 'lengkap';

        const systemInstruction = `Kamu adalah guru profesional Indonesia yang ahli membuat materi pembelajaran.

Buatkan materi pembelajaran ${format} dengan tingkat kedalaman ${tingkat} yang mencakup:
1. Judul dan Pendahuluan
2. Tujuan Pembelajaran
3. Uraian Materi (penjelasan konsep, contoh, ilustrasi)
4. Rangkuman / Poin Penting
5. Kata Kunci / Glosarium
6. Latihan Soal sederhana
7. Referensi

Materi harus:
- Sesuai dengan tingkat perkembangan siswa
- Menggunakan bahasa yang mudah dipahami
- Menyertakan contoh konkret dan relevan
- Terstruktur dengan baik

Output dalam format JSON.`;

        const prompt = `Buatkan materi pembelajaran untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}
- Tingkat Kedalaman: ${tingkat}
- Format: ${format}`;

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

        const materiData = {
            judul: konten.judul || dto.topik,
            kelas: dto.kelas,
            ringkasan: konten.ringkasan || konten.rangkuman || '',
            konten_text: konten.uraian_materi || '',
            poin_penting: konten.poin_penting || konten.rangkuman || [],
            kata_kunci: konten.kata_kunci || konten.glosarium || [],
            konten,
        };

        if (dto.save_to_db !== false) {
            const saved = await this.create(userId, materiData);
            return { ...saved, ai_response: { model: response.model, usage: response.usage } };
        }

        return { ...materiData, ai_response: { model: response.model, usage: response.usage } };
    }

    async *generateStream(userId: string, dto: GenerateMateriDto): AsyncGenerator<string> {
        const systemInstruction = `Kamu adalah guru profesional Indonesia. Buat materi pembelajaran dalam format markdown yang mudah dibaca.`;

        const prompt = `Buatkan materi pembelajaran lengkap untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}`;

        const generator = this.geminiService.chatStream({
            model: (dto.model || 'gemini-1.5-flash') as any,
            messages: [{ role: 'user', content: prompt }],
            systemInstruction,
        });

        for await (const chunk of generator) {
            yield chunk;
        }
    }
}
