import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import { CreateKompetensiDasarDto, UpdateKompetensiDasarDto, GenerateKDDto, KDQueryDto } from './dto/kd.dto';

@Injectable()
export class KompetensiDasarService {
    private readonly logger = new Logger(KompetensiDasarService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    async findAll(query?: KDQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('kompetensi_dasar')
            .select(`*, mapel:mapel_id(id, nama)`)
            .order('kode', { ascending: true });

        if (query?.mapel_id) dbQuery = dbQuery.eq('mapel_id', query.mapel_id);
        if (query?.kelas) dbQuery = dbQuery.eq('kelas', query.kelas);
        if (query?.aspek) dbQuery = dbQuery.eq('aspek', query.aspek);
        if (query?.limit) dbQuery = dbQuery.limit(query.limit);
        if (query?.offset) dbQuery = dbQuery.range(query.offset, query.offset + (query.limit || 10) - 1);

        const { data, error } = await dbQuery;
        if (error) throw error;
        return data;
    }

    async findOne(id: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('kompetensi_dasar')
            .select(`*, mapel:mapel_id(id, nama)`)
            .eq('id', id)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`KD dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async create(dto: CreateKompetensiDasarDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('kompetensi_dasar')
            .insert(dto)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, dto: UpdateKompetensiDasarDto) {
        await this.findOne(id);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('kompetensi_dasar')
            .update(dto)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async remove(id: string) {
        await this.findOne(id);

        const { error } = await this.supabaseService
            .getClient()
            .from('kompetensi_dasar')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { message: 'KD berhasil dihapus' };
    }

    async lookup(dto: GenerateKDDto) {
        const kurikulum = dto.kurikulum || 'Kurikulum Merdeka';

        const systemInstruction = `Kamu adalah ahli kurikulum Indonesia.
Berikan daftar Kompetensi Dasar (KD) resmi untuk mata pelajaran dan kelas yang diminta.

Format output JSON:
{
  "mapel": "...",
  "kelas": "...",
  "kompetensi_dasar": [
    {
      "kode": "3.1",
      "aspek": "Pengetahuan",
      "deskripsi": "...",
      "indikator": ["..."]
    },
    {
      "kode": "4.1",
      "aspek": "Keterampilan",
      "deskripsi": "...",
      "indikator": ["..."]
    }
  ]
}`;

        const prompt = `Berikan Kompetensi Dasar untuk:
- Mata Pelajaran: ${dto.mapel}
- Kelas: ${dto.kelas}
- Kurikulum: ${kurikulum}`;

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

        return {
            mapel: dto.mapel,
            kelas: dto.kelas,
            kurikulum,
            ...konten,
            ai_response: { model: response.model, usage: response.usage },
        };
    }
}
