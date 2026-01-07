import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    CreateRppDto,
    UpdateRppDto,
    GenerateRppDto,
    RppQueryDto,
    RppStatus,
} from './dto/rpp.dto';

@Injectable()
export class RppService {
    private readonly logger = new Logger(RppService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    /**
     * Get all RPP for a user with optional filters
     */
    async findAll(userId: string, query?: RppQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('rpp')
            .select(`
        *,
        mapel:mapel_id(id, nama)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (query?.mapel_id) {
            dbQuery = dbQuery.eq('mapel_id', query.mapel_id);
        }
        if (query?.kelas) {
            dbQuery = dbQuery.eq('kelas', query.kelas);
        }
        if (query?.status) {
            dbQuery = dbQuery.eq('status', query.status);
        }
        if (query?.search) {
            dbQuery = dbQuery.ilike('judul', `%${query.search}%`);
        }
        if (query?.limit) {
            dbQuery = dbQuery.limit(query.limit);
        }
        if (query?.offset) {
            dbQuery = dbQuery.range(query.offset, query.offset + (query.limit || 10) - 1);
        }

        const { data, error } = await dbQuery;

        if (error) {
            this.logger.error('Error fetching RPP:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Get single RPP by ID
     */
    async findOne(id: string, userId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('rpp')
            .select(`
        *,
        mapel:mapel_id(id, nama, kode),
        silabus:silabus_id(id, tahun_ajaran, semester)
      `)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new NotFoundException(`RPP dengan ID ${id} tidak ditemukan`);
            }
            this.logger.error('Error fetching RPP:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Create RPP manually
     */
    async create(userId: string, dto: CreateRppDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('rpp')
            .insert({
                user_id: userId,
                ...dto,
                status: dto.status || RppStatus.DRAFT,
            })
            .select()
            .single();

        if (error) {
            this.logger.error('Error creating RPP:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Update RPP
     */
    async update(id: string, userId: string, dto: UpdateRppDto) {
        await this.findOne(id, userId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('rpp')
            .update({
                ...dto,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            this.logger.error('Error updating RPP:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Delete RPP
     */
    async remove(id: string, userId: string) {
        await this.findOne(id, userId);

        const { error } = await this.supabaseService
            .getClient()
            .from('rpp')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            this.logger.error('Error deleting RPP:', error.message);
            throw error;
        }

        return { message: 'RPP berhasil dihapus' };
    }

    /**
     * Duplicate RPP
     */
    async duplicate(id: string, userId: string) {
        const original = await this.findOne(id, userId);

        // Remove id and timestamps
        const { id: _, created_at, updated_at, ...rppData } = original;

        const { data, error } = await this.supabaseService
            .getClient()
            .from('rpp')
            .insert({
                ...rppData,
                judul: `${original.judul} (Copy)`,
                status: RppStatus.DRAFT,
            })
            .select()
            .single();

        if (error) {
            this.logger.error('Error duplicating RPP:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Generate RPP using AI
     */
    async generate(userId: string, dto: GenerateRppDto) {
        const systemInstruction = dto.system_instruction ||
            `Kamu adalah asisten guru profesional Indonesia yang ahli dalam membuat RPP (Rencana Pelaksanaan Pembelajaran) sesuai ${dto.kurikulum || 'Kurikulum Merdeka'}.
      
Buat RPP yang lengkap dan terstruktur dengan format:
1. Identitas (Mata Pelajaran, Kelas, Alokasi Waktu)
2. Tujuan Pembelajaran
3. Profil Pelajar Pancasila yang relevan
4. Sarana dan Prasarana
5. Target Peserta Didik
6. Model Pembelajaran
7. Kegiatan Pembelajaran:
   - Pendahuluan (dengan estimasi waktu)
   - Inti (dengan estimasi waktu)
   - Penutup (dengan estimasi waktu)
8. Asesmen (formatif dan sumatif)
9. Refleksi Guru
10. Lampiran (jika diperlukan)

Gunakan bahasa Indonesia yang baik dan benar. Format output dalam JSON.`;

        const prompt = `Buatkan RPP untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik/Materi: ${dto.topik}
- Kelas: ${dto.kelas}
- Alokasi Waktu: ${dto.alokasi_waktu || 90} menit

Berikan output dalam format JSON dengan struktur yang lengkap.`;

        try {
            const response = await this.geminiService.chat({
                model: (dto.model || 'gemini-2.5-flash') as 'gemini-2.5-flash',
                messages: [{ role: 'user', content: prompt }],
                systemInstruction,
                responseFormat: { type: 'json_object' },
            });

            let kontenLengkap: Record<string, any> = {};
            try {
                kontenLengkap = JSON.parse(response.content);
            } catch {
                kontenLengkap = { raw_content: response.content };
            }

            const rppData = {
                judul: dto.topik,
                kelas: dto.kelas,
                materi_pokok: dto.topik,
                alokasi_waktu: dto.alokasi_waktu || 90,
                tujuan_pembelajaran: kontenLengkap.tujuan_pembelajaran || [],
                kegiatan: kontenLengkap.kegiatan_pembelajaran || {},
                asesmen: kontenLengkap.asesmen || {},
                konten_lengkap: kontenLengkap,
                status: RppStatus.DRAFT,
            };

            // Optionally save to database
            if (dto.save_to_db !== false) {
                const saved = await this.create(userId, rppData);
                return {
                    ...saved,
                    ai_response: {
                        model: response.model,
                        usage: response.usage,
                    },
                };
            }

            return {
                ...rppData,
                ai_response: {
                    model: response.model,
                    usage: response.usage,
                },
            };
        } catch (error) {
            this.logger.error('Error generating RPP:', error);
            throw error;
        }
    }

    /**
     * Generate RPP using AI with streaming
     */
    async *generateStream(userId: string, dto: GenerateRppDto): AsyncGenerator<string> {
        const systemInstruction = dto.system_instruction ||
            `Kamu adalah asisten guru profesional Indonesia yang ahli dalam membuat RPP sesuai ${dto.kurikulum || 'Kurikulum Merdeka'}.
Buat RPP yang lengkap dengan format yang terstruktur untuk ditampilkan secara streaming.`;

        const prompt = `Buatkan RPP lengkap untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik/Materi: ${dto.topik}
- Kelas: ${dto.kelas}
- Alokasi Waktu: ${dto.alokasi_waktu || 90} menit

Gunakan format markdown yang rapi dan mudah dibaca.`;

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
