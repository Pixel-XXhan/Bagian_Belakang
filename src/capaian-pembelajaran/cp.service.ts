import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    CreateCapaianPembelajaranDto,
    UpdateCapaianPembelajaranDto,
    GetCapaianPembelajaranDto,
    CapaianPembelajaranQueryDto,
} from './dto/cp.dto';

@Injectable()
export class CapaianPembelajaranService {
    private readonly logger = new Logger(CapaianPembelajaranService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    async findAll(userId: string, query?: CapaianPembelajaranQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('capaian_pembelajaran')
            .select(`*, mapel:mapel_id(id, nama)`)
            .eq('user_id', userId)
            .order('fase', { ascending: true });

        if (query?.mapel_id) dbQuery = dbQuery.eq('mapel_id', query.mapel_id);
        if (query?.fase) dbQuery = dbQuery.eq('fase', query.fase);
        if (query?.search) dbQuery = dbQuery.ilike('elemen', `%${query.search}%`);
        if (query?.limit) dbQuery = dbQuery.limit(query.limit);
        if (query?.offset) dbQuery = dbQuery.range(query.offset, query.offset + (query.limit || 10) - 1);

        const { data, error } = await dbQuery;
        if (error) throw error;
        return data;
    }

    async findOne(id: string, userId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('capaian_pembelajaran')
            .select(`*, mapel:mapel_id(id, nama, kode)`)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`Capaian Pembelajaran dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async create(userId: string, dto: CreateCapaianPembelajaranDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('capaian_pembelajaran')
            .insert({ user_id: userId, ...dto })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, userId: string, dto: UpdateCapaianPembelajaranDto) {
        await this.findOne(id, userId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('capaian_pembelajaran')
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
            .from('capaian_pembelajaran')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        return { message: 'Capaian Pembelajaran berhasil dihapus' };
    }

    async getFromKurikulum(dto: GetCapaianPembelajaranDto) {
        const faseDescription = {
            A: 'Fase A (Kelas 1-2 SD)',
            B: 'Fase B (Kelas 3-4 SD)',
            C: 'Fase C (Kelas 5-6 SD)',
            D: 'Fase D (Kelas 7-9 SMP)',
            E: 'Fase E (Kelas 10 SMA)',
            F: 'Fase F (Kelas 11-12 SMA)',
        };

        const systemInstruction = `Kamu adalah ahli kurikulum Indonesia yang menguasai Capaian Pembelajaran Kurikulum Merdeka.

Berikan Capaian Pembelajaran resmi untuk mata pelajaran dan fase yang diminta. Capaian harus sesuai dengan dokumen Kemendikbudristek.

Struktur output:
{
  "mapel": "...",
  "fase": "...",
  "deskripsi_fase": "...",
  "elemen": [
    {
      "nama": "...",
      "deskripsi": "...",
      "sub_elemen": [...]
    }
  ],
  "catatan": "..."
}`;

        const prompt = `Berikan Capaian Pembelajaran untuk:
- Mata Pelajaran: ${dto.mapel}
- Fase: ${dto.fase} (${faseDescription[dto.fase as keyof typeof faseDescription] || dto.fase})`;

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

        return {
            mapel: dto.mapel,
            fase: dto.fase,
            ...konten,
            ai_response: { model: response.model, usage: response.usage },
        };
    }
}
