import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    CreateMediaDto,
    UpdateMediaDto,
    GenerateMediaRecommendationDto,
    MediaQueryDto,
    JenisMedia,
} from './dto/media.dto';

@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    async findAll(userId: string, query?: MediaQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('media_pembelajaran')
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
            .from('media_pembelajaran')
            .select(`*, mapel:mapel_id(id, nama, kode)`)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`Media dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async create(userId: string, dto: CreateMediaDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('media_pembelajaran')
            .insert({ user_id: userId, ...dto })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, userId: string, dto: UpdateMediaDto) {
        await this.findOne(id, userId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('media_pembelajaran')
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
            .from('media_pembelajaran')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        return { message: 'Media berhasil dihapus' };
    }

    async generateRecommendation(userId: string, dto: GenerateMediaRecommendationDto) {
        const systemInstruction = `Kamu adalah ahli teknologi pendidikan Indonesia.

Berikan rekomendasi media pembelajaran yang sesuai dengan:
1. Jenis media (video, gambar, audio, interaktif, dll)
2. Deskripsi singkat media
3. Cara penggunaan dalam pembelajaran
4. Link/sumber yang dapat diakses (jika ada)
5. Alternatif pembuatan sendiri

Untuk setiap rekomendasi, pertimbangkan:
- Kesesuaian dengan usia/tingkat siswa
- Ketersediaan dan aksesibilitas
- Efektivitas dalam menyampaikan konsep
- Keterlibatan siswa (engagement)

Output dalam format JSON array.`;

        const prompt = `Berikan rekomendasi media pembelajaran untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}
${dto.jenis ? `- Jenis yang diinginkan: ${dto.jenis}` : '- Semua jenis media yang relevan'}`;

        const response = await this.geminiService.chat({
            model: (dto.model || 'gemini-1.5-flash') as any,
            messages: [{ role: 'user', content: prompt }],
            systemInstruction,
            responseFormat: { type: 'json_object' },
        });

        let recommendations: any[] = [];
        try {
            const parsed = JSON.parse(response.content);
            recommendations = Array.isArray(parsed) ? parsed : parsed.rekomendasi || parsed.recommendations || [parsed];
        } catch {
            recommendations = [{ raw_content: response.content }];
        }

        return {
            topik: dto.topik,
            mapel: dto.mapel,
            kelas: dto.kelas,
            rekomendasi: recommendations,
            ai_response: { model: response.model, usage: response.usage },
        };
    }

    async getStatistics(userId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('media_pembelajaran')
            .select('jenis')
            .eq('user_id', userId);

        if (error) throw error;

        const stats = {
            total: data.length,
            by_jenis: {} as Record<string, number>,
        };

        data.forEach((m) => {
            stats.by_jenis[m.jenis] = (stats.by_jenis[m.jenis] || 0) + 1;
        });

        return stats;
    }
}
