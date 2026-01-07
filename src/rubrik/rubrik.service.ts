import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    CreateRubrikDto,
    UpdateRubrikDto,
    GenerateRubrikDto,
    RubrikQueryDto,
} from './dto/rubrik.dto';

@Injectable()
export class RubrikService {
    private readonly logger = new Logger(RubrikService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    async findAll(userId: string, query?: RubrikQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('rubrik_penilaian')
            .select(`*, mapel:mapel_id(id, nama)`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (query?.mapel_id) dbQuery = dbQuery.eq('mapel_id', query.mapel_id);
        if (query?.jenis_penilaian) dbQuery = dbQuery.eq('jenis_penilaian', query.jenis_penilaian);
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
            .from('rubrik_penilaian')
            .select(`*, mapel:mapel_id(id, nama, kode)`)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`Rubrik dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async create(userId: string, dto: CreateRubrikDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('rubrik_penilaian')
            .insert({ user_id: userId, ...dto })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, userId: string, dto: UpdateRubrikDto) {
        await this.findOne(id, userId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('rubrik_penilaian')
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
            .from('rubrik_penilaian')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        return { message: 'Rubrik berhasil dihapus' };
    }

    async generate(userId: string, dto: GenerateRubrikDto) {
        const jumlahLevel = dto.jumlah_level || 4;
        const levelLabels = jumlahLevel === 4
            ? ['Sangat Kurang (1)', 'Kurang (2)', 'Baik (3)', 'Sangat Baik (4)']
            : Array.from({ length: jumlahLevel }, (_, i) => `Level ${i + 1}`);

        const systemInstruction = `Kamu adalah ahli penilaian Indonesia yang menguasai rubrik Kurikulum Merdeka.

Buatkan rubrik penilaian dengan format:
1. Kriteria penilaian yang jelas dan terukur
2. Deskripsi untuk setiap level pencapaian: ${levelLabels.join(', ')}
3. Bobot untuk setiap kriteria (total 100%)
4. Indikator yang observable dan terukur

Rubrik harus:
- Sesuai dengan karakteristik tugas
- Objektif dan dapat diandalkan
- Mudah dipahami siswa dan guru
- Memberikan feedback yang konstruktif

Output dalam format JSON dengan struktur:
{
  "judul": "...",
  "jenis_penilaian": "...",
  "kriteria": [
    {
      "nama": "...",
      "bobot": 25,
      "deskripsi": {
        "level_1": "...",
        "level_2": "...",
        "level_3": "...",
        "level_4": "..."
      }
    }
  ],
  "skala": "1-4"
}`;

        const prompt = `Buatkan rubrik penilaian untuk:
- Mata Pelajaran: ${dto.mapel}
- Tugas/Topik: ${dto.topik}
- Kelas: ${dto.kelas}
- Jenis Penilaian: ${dto.jenis_penilaian || 'Kinerja'}
- Jumlah Kriteria: ${dto.jumlah_kriteria || 4}
- Jumlah Level: ${jumlahLevel}`;

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

        const rubrikData = {
            judul: konten.judul || `Rubrik ${dto.jenis_penilaian || 'Penilaian'} - ${dto.topik}`,
            kelas: dto.kelas,
            jenis_penilaian: dto.jenis_penilaian || 'Kinerja',
            skala: konten.skala || `1-${jumlahLevel}`,
            kriteria: konten.kriteria || {},
            konten,
        };

        if (dto.save_to_db !== false) {
            const saved = await this.create(userId, rubrikData);
            return { ...saved, ai_response: { model: response.model, usage: response.usage } };
        }

        return { ...rubrikData, ai_response: { model: response.model, usage: response.usage } };
    }
}
