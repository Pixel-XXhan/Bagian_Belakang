import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    CreateAsesmenDto,
    UpdateAsesmenDto,
    GenerateAsesmenDto,
    AsesmenQueryDto,
    JenisAsesmen,
} from './dto/asesmen.dto';

@Injectable()
export class AsesmenService {
    private readonly logger = new Logger(AsesmenService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    async findAll(userId: string, query?: AsesmenQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('asesmen')
            .select(`*, mapel:mapel_id(id, nama)`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (query?.jenis) dbQuery = dbQuery.eq('jenis', query.jenis);
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
            .from('asesmen')
            .select(`*, mapel:mapel_id(id, nama, kode)`)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`Asesmen dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async findOneWithSoal(id: string, userId: string) {
        const asesmen = await this.findOne(id, userId);

        if (asesmen.soal_ids && asesmen.soal_ids.length > 0) {
            const { data: soal, error } = await this.supabaseService
                .getClient()
                .from('bank_soal')
                .select('*')
                .in('id', asesmen.soal_ids);

            if (!error) {
                asesmen.soal = soal;
            }
        }

        return asesmen;
    }

    async create(userId: string, dto: CreateAsesmenDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('asesmen')
            .insert({ user_id: userId, ...dto })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, userId: string, dto: UpdateAsesmenDto) {
        await this.findOne(id, userId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('asesmen')
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
            .from('asesmen')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        return { message: 'Asesmen berhasil dihapus' };
    }

    async generate(userId: string, dto: GenerateAsesmenDto) {
        const jenisDescription = {
            [JenisAsesmen.DIAGNOSTIK]: 'Asesmen diagnostik untuk mengidentifikasi kesiapan belajar dan pengetahuan awal siswa',
            [JenisAsesmen.FORMATIF]: 'Asesmen formatif untuk memantau proses pembelajaran',
            [JenisAsesmen.SUMATIF]: 'Asesmen sumatif untuk mengukur pencapaian tujuan pembelajaran',
        };

        const systemInstruction = `Kamu adalah ahli asesmen pendidikan Indonesia sesuai Kurikulum Merdeka.

Buat ${jenisDescription[dto.jenis]} dengan komponen:
1. Tujuan asesmen
2. Indikator pencapaian
3. Rubrik penilaian
4. Daftar soal (pilihan ganda dan essay)
5. Pedoman penskoran

Output dalam format JSON dengan struktur:
{
  "tujuan": "...",
  "indikator": [...],
  "rubrik": {...},
  "soal": [
    { "tipe": "pilihan_ganda", "pertanyaan": "...", "pilihan": [...], "jawaban": "...", "skor": 10 },
    { "tipe": "essay", "pertanyaan": "...", "kunci_jawaban": "...", "skor": 20 }
  ],
  "total_skor": 100
}`;

        const prompt = `Buatkan ${dto.jenis} lengkap untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}
- Jumlah soal: ${dto.jumlah_soal || 10}`;

        const response = await this.geminiService.chat({
            model: (dto.model || 'gemini-2.5-flash') as 'gemini-2.5-flash',
            messages: [{ role: 'user', content: prompt }],
            systemInstruction,
            responseFormat: { type: 'json_object' },
        });

        let rubrik: Record<string, any> = {};
        try {
            rubrik = JSON.parse(response.content);
        } catch {
            rubrik = { raw_content: response.content };
        }

        const asesmenData = {
            jenis: dto.jenis,
            judul: `${dto.jenis.charAt(0).toUpperCase() + dto.jenis.slice(1)} - ${dto.topik}`,
            kelas: dto.kelas,
            rubrik,
        };

        if (dto.save_to_db !== false) {
            const saved = await this.create(userId, asesmenData);
            return { ...saved, ai_response: { model: response.model, usage: response.usage } };
        }

        return { ...asesmenData, ai_response: { model: response.model, usage: response.usage } };
    }

    async addSoal(id: string, userId: string, soalIds: string[]) {
        const asesmen = await this.findOne(id, userId);
        const existingSoalIds = asesmen.soal_ids || [];
        const newSoalIds = [...new Set([...existingSoalIds, ...soalIds])];

        const { data, error } = await this.supabaseService
            .getClient()
            .from('asesmen')
            .update({ soal_ids: newSoalIds, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async removeSoal(id: string, userId: string, soalId: string) {
        const asesmen = await this.findOne(id, userId);
        const existingSoalIds = asesmen.soal_ids || [];
        const newSoalIds = existingSoalIds.filter((sid: string) => sid !== soalId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('asesmen')
            .update({ soal_ids: newSoalIds, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
