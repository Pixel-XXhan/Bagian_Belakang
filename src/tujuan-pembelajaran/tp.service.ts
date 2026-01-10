import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    CreateTujuanPembelajaranDto,
    UpdateTujuanPembelajaranDto,
    GenerateTujuanPembelajaranDto,
    TujuanPembelajaranQueryDto,
} from './dto/tp.dto';

@Injectable()
export class TujuanPembelajaranService {
    private readonly logger = new Logger(TujuanPembelajaranService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    async findAll(userId: string, query?: TujuanPembelajaranQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('tujuan_pembelajaran')
            .select(`*, mapel:mapel_id(id, nama), atp:atp_id(id, judul)`)
            .eq('user_id', userId)
            .order('urutan', { ascending: true });

        if (query?.mapel_id) dbQuery = dbQuery.eq('mapel_id', query.mapel_id);
        if (query?.atp_id) dbQuery = dbQuery.eq('atp_id', query.atp_id);
        if (query?.kelas) dbQuery = dbQuery.eq('kelas', query.kelas);
        if (query?.search) dbQuery = dbQuery.ilike('deskripsi', `%${query.search}%`);
        if (query?.limit) dbQuery = dbQuery.limit(query.limit);
        if (query?.offset) dbQuery = dbQuery.range(query.offset, query.offset + (query.limit || 10) - 1);

        const { data, error } = await dbQuery;
        if (error) throw error;
        return data;
    }

    async findOne(id: string, userId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('tujuan_pembelajaran')
            .select(`*, mapel:mapel_id(id, nama, kode), atp:atp_id(id, judul, fase)`)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`Tujuan Pembelajaran dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async create(userId: string, dto: CreateTujuanPembelajaranDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('tujuan_pembelajaran')
            .insert({ user_id: userId, ...dto })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async createBulk(userId: string, dtos: CreateTujuanPembelajaranDto[]) {
        const withUser = dtos.map((dto, index) => ({
            user_id: userId,
            urutan: dto.urutan || index + 1,
            ...dto
        }));

        const { data, error } = await this.supabaseService
            .getClient()
            .from('tujuan_pembelajaran')
            .insert(withUser)
            .select();

        if (error) throw error;
        return data;
    }

    async update(id: string, userId: string, dto: UpdateTujuanPembelajaranDto) {
        await this.findOne(id, userId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('tujuan_pembelajaran')
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
            .from('tujuan_pembelajaran')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        return { message: 'Tujuan Pembelajaran berhasil dihapus' };
    }

    async generate(userId: string, dto: GenerateTujuanPembelajaranDto) {
        const jumlah = dto.jumlah || 3;

        const systemInstruction = `Kamu adalah ahli kurikulum Indonesia yang menguasai penyusunan Tujuan Pembelajaran (TP) sesuai Kurikulum Merdeka.

Buatkan ${jumlah} Tujuan Pembelajaran dengan kriteria SMART:
- Specific: Spesifik dan jelas
- Measurable: Dapat diukur ketercapaiannya
- Achievable: Dapat dicapai siswa
- Relevant: Relevan dengan CP dan kehidupan
- Time-bound: Memiliki batasan waktu

Setiap TP harus mencakup:
1. Deskripsi tujuan yang operasional
2. Kata kerja operasional (sesuai taksonomi Bloom)
3. Level kognitif (C1-C6)
4. Indikator ketercapaian
5. Estimasi alokasi waktu

${dto.capaian_pembelajaran ? `Berdasarkan Capaian Pembelajaran: ${dto.capaian_pembelajaran}` : ''}

Output dalam format JSON array.`;

        const prompt = `Buatkan ${jumlah} Tujuan Pembelajaran untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}`;

        const response = await this.geminiService.chat({
            model: (dto.model || 'gemini-1.5-flash') as any,
            messages: [{ role: 'user', content: prompt }],
            systemInstruction,
            responseFormat: { type: 'json_object' },
        });

        let tpList: any[] = [];
        try {
            const parsed = JSON.parse(response.content);
            tpList = Array.isArray(parsed) ? parsed : parsed.tujuan_pembelajaran || parsed.tp || [parsed];
        } catch {
            tpList = [{ deskripsi: response.content }];
        }

        const formattedTp: CreateTujuanPembelajaranDto[] = tpList.map((tp, index) => ({
            deskripsi: tp.deskripsi || tp.tujuan || '',
            kelas: dto.kelas,
            urutan: index + 1,
            alokasi_waktu: tp.alokasi_waktu || 45,
            indikator: tp.indikator || [],
            kata_kerja_operasional: tp.kata_kerja_operasional || tp.kko || '',
            level_kognitif: tp.level_kognitif || tp.level || '',
        }));

        if (dto.save_to_db !== false) {
            const saved = await this.createBulk(userId, formattedTp);
            return {
                count: saved.length,
                tujuan_pembelajaran: saved,
                ai_response: { model: response.model, usage: response.usage },
            };
        }

        return {
            count: formattedTp.length,
            tujuan_pembelajaran: formattedTp,
            ai_response: { model: response.model, usage: response.usage },
        };
    }
}
