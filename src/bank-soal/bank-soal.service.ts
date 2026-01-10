import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    CreateSoalDto,
    UpdateSoalDto,
    GenerateSoalDto,
    SoalQueryDto,
    TipeSoal,
    TingkatKesulitan,
} from './dto/bank-soal.dto';

@Injectable()
export class BankSoalService {
    private readonly logger = new Logger(BankSoalService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    async findAll(userId: string, query?: SoalQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('bank_soal')
            .select(`*, mapel:mapel_id(id, nama)`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (query?.mapel_id) dbQuery = dbQuery.eq('mapel_id', query.mapel_id);
        if (query?.tipe) dbQuery = dbQuery.eq('tipe', query.tipe);
        if (query?.tingkat_kesulitan) dbQuery = dbQuery.eq('tingkat_kesulitan', query.tingkat_kesulitan);
        if (query?.search) dbQuery = dbQuery.ilike('pertanyaan', `%${query.search}%`);
        if (query?.limit) dbQuery = dbQuery.limit(query.limit);
        if (query?.offset) dbQuery = dbQuery.range(query.offset, query.offset + (query.limit || 10) - 1);

        const { data, error } = await dbQuery;
        if (error) throw error;
        return data;
    }

    async findOne(id: string, userId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('bank_soal')
            .select(`*, mapel:mapel_id(id, nama, kode)`)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`Soal dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async create(userId: string, dto: CreateSoalDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('bank_soal')
            .insert({ user_id: userId, ...dto })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async createBulk(userId: string, soalList: CreateSoalDto[]) {
        const soalWithUser = soalList.map((s) => ({ user_id: userId, ...s }));

        const { data, error } = await this.supabaseService
            .getClient()
            .from('bank_soal')
            .insert(soalWithUser)
            .select();

        if (error) throw error;
        return data;
    }

    async update(id: string, userId: string, dto: UpdateSoalDto) {
        await this.findOne(id, userId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('bank_soal')
            .update(dto)
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
            .from('bank_soal')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        return { message: 'Soal berhasil dihapus' };
    }

    async generate(userId: string, dto: GenerateSoalDto) {
        const tipe = dto.tipe || TipeSoal.PILIHAN_GANDA;
        const tingkat = dto.tingkat_kesulitan || TingkatKesulitan.SEDANG;
        const jumlah = dto.jumlah || 5;

        const tipeInstruction = {
            [TipeSoal.PILIHAN_GANDA]: 'Buat soal pilihan ganda dengan 4 opsi (A, B, C, D)',
            [TipeSoal.ESSAY]: 'Buat soal essay/uraian',
            [TipeSoal.ISIAN_SINGKAT]: 'Buat soal isian singkat',
            [TipeSoal.BENAR_SALAH]: 'Buat soal benar/salah',
            [TipeSoal.MENJODOHKAN]: 'Buat soal menjodohkan',
        };

        const systemInstruction = `Kamu adalah pembuat soal profesional Indonesia.
${tipeInstruction[tipe]} dengan tingkat kesulitan ${tingkat}.

Output dalam format JSON array dengan struktur:
[
  {
    "pertanyaan": "...",
    "pilihan": [{"label": "A", "text": "..."}, ...],  // untuk pilihan ganda
    "jawaban_benar": "...",
    "pembahasan": "..."
  }
]`;

        const prompt = `Buatkan ${jumlah} soal ${tipe.replace('_', ' ')} untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}
- Tingkat Kesulitan: ${tingkat}`;

        const response = await this.geminiService.chat({
            model: (dto.model || 'gemini-1.5-flash') as any,
            messages: [{ role: 'user', content: prompt }],
            systemInstruction,
            responseFormat: { type: 'json_object' },
        });

        let soalList: any[] = [];
        try {
            const parsed = JSON.parse(response.content);
            soalList = Array.isArray(parsed) ? parsed : parsed.soal || parsed.questions || [parsed];
        } catch {
            soalList = [{ pertanyaan: response.content, jawaban_benar: '', pembahasan: '' }];
        }

        // Format soal
        const formattedSoal: CreateSoalDto[] = soalList.map((s) => ({
            tipe,
            tingkat_kesulitan: tingkat,
            pertanyaan: s.pertanyaan || s.question || '',
            pilihan: s.pilihan || s.options || null,
            jawaban_benar: s.jawaban_benar || s.answer || '',
            pembahasan: s.pembahasan || s.explanation || '',
        }));

        if (dto.save_to_db !== false) {
            const saved = await this.createBulk(userId, formattedSoal);
            return {
                count: saved.length,
                soal: saved,
                ai_response: { model: response.model, usage: response.usage },
            };
        }

        return {
            count: formattedSoal.length,
            soal: formattedSoal,
            ai_response: { model: response.model, usage: response.usage },
        };
    }

    async getStatistics(userId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('bank_soal')
            .select('tipe, tingkat_kesulitan')
            .eq('user_id', userId);

        if (error) throw error;

        const stats = {
            total: data.length,
            by_tipe: {} as Record<string, number>,
            by_tingkat: {} as Record<string, number>,
        };

        data.forEach((s) => {
            stats.by_tipe[s.tipe] = (stats.by_tipe[s.tipe] || 0) + 1;
            stats.by_tingkat[s.tingkat_kesulitan] = (stats.by_tingkat[s.tingkat_kesulitan] || 0) + 1;
        });

        return stats;
    }
}
