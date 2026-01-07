import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    CreateSilabusDto,
    UpdateSilabusDto,
    GenerateSilabusDto,
    SilabusQueryDto,
} from './dto/silabus.dto';

@Injectable()
export class SilabusService {
    private readonly logger = new Logger(SilabusService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    async findAll(userId: string, query?: SilabusQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('silabus')
            .select(`*, mapel:mapel_id(id, nama)`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (query?.mapel_id) dbQuery = dbQuery.eq('mapel_id', query.mapel_id);
        if (query?.kelas) dbQuery = dbQuery.eq('kelas', query.kelas);
        if (query?.semester) dbQuery = dbQuery.eq('semester', query.semester);
        if (query?.tahun_ajaran) dbQuery = dbQuery.eq('tahun_ajaran', query.tahun_ajaran);

        const { data, error } = await dbQuery;
        if (error) throw error;
        return data;
    }

    async findOne(id: string, userId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('silabus')
            .select(`*, mapel:mapel_id(id, nama, kode)`)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`Silabus dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async create(userId: string, dto: CreateSilabusDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('silabus')
            .insert({ user_id: userId, ...dto })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, userId: string, dto: UpdateSilabusDto) {
        await this.findOne(id, userId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('silabus')
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
            .from('silabus')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        return { message: 'Silabus berhasil dihapus' };
    }

    async generate(userId: string, dto: GenerateSilabusDto) {
        const systemInstruction = `Kamu adalah asisten guru profesional Indonesia yang ahli dalam membuat Silabus sesuai ${dto.kurikulum || 'Kurikulum Merdeka'}.

Buat Silabus yang lengkap dengan komponen:
1. Identitas (Sekolah, Mapel, Kelas, Semester, Tahun Ajaran)
2. Kompetensi Inti (KI)
3. Kompetensi Dasar (KD)
4. Materi Pembelajaran (per pertemuan)
5. Kegiatan Pembelajaran
6. Indikator Pencapaian
7. Penilaian (Teknik, Bentuk Instrumen)
8. Alokasi Waktu
9. Sumber Belajar

Output dalam format JSON.`;

        const prompt = `Buatkan Silabus untuk:
- Mata Pelajaran: ${dto.mapel}
- Kelas: ${dto.kelas}
- Semester: ${dto.semester}
- Tahun Ajaran: ${dto.tahun_ajaran || '2024/2025'}`;

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

        const silabusData = {
            kelas: dto.kelas,
            semester: dto.semester,
            tahun_ajaran: dto.tahun_ajaran || '2024/2025',
            konten,
        };

        if (dto.save_to_db !== false) {
            const saved = await this.create(userId, silabusData);
            return { ...saved, ai_response: { model: response.model, usage: response.usage } };
        }

        return { ...silabusData, ai_response: { model: response.model, usage: response.usage } };
    }

    async *generateStream(userId: string, dto: GenerateSilabusDto): AsyncGenerator<string> {
        const systemInstruction = `Kamu adalah asisten guru profesional Indonesia. Buat Silabus lengkap dalam format markdown.`;

        const prompt = `Buatkan Silabus untuk:
- Mata Pelajaran: ${dto.mapel}
- Kelas: ${dto.kelas}
- Semester: ${dto.semester}
- Tahun Ajaran: ${dto.tahun_ajaran || '2024/2025'}`;

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
