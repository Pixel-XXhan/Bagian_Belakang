import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    CreateKegiatanDto,
    UpdateKegiatanDto,
    GenerateKegiatanDto,
    KegiatanQueryDto,
    FaseKegiatan,
} from './dto/kegiatan.dto';

@Injectable()
export class KegiatanService {
    private readonly logger = new Logger(KegiatanService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    async findAll(userId: string, query?: KegiatanQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('kegiatan_pembelajaran')
            .select(`*, rpp:rpp_id(id, judul)`)
            .eq('user_id', userId)
            .order('fase', { ascending: true })
            .order('urutan', { ascending: true });

        if (query?.rpp_id) dbQuery = dbQuery.eq('rpp_id', query.rpp_id);
        if (query?.fase) dbQuery = dbQuery.eq('fase', query.fase);
        if (query?.search) dbQuery = dbQuery.ilike('nama', `%${query.search}%`);
        if (query?.limit) dbQuery = dbQuery.limit(query.limit);
        if (query?.offset) dbQuery = dbQuery.range(query.offset, query.offset + (query.limit || 10) - 1);

        const { data, error } = await dbQuery;
        if (error) throw error;
        return data;
    }

    async findOne(id: string, userId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('kegiatan_pembelajaran')
            .select(`*, rpp:rpp_id(id, judul, materi_pokok)`)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`Kegiatan dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async create(userId: string, dto: CreateKegiatanDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('kegiatan_pembelajaran')
            .insert({ user_id: userId, ...dto })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async createBulk(userId: string, dtos: CreateKegiatanDto[]) {
        const withUser = dtos.map((dto) => ({ user_id: userId, ...dto }));

        const { data, error } = await this.supabaseService
            .getClient()
            .from('kegiatan_pembelajaran')
            .insert(withUser)
            .select();

        if (error) throw error;
        return data;
    }

    async update(id: string, userId: string, dto: UpdateKegiatanDto) {
        await this.findOne(id, userId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('kegiatan_pembelajaran')
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
            .from('kegiatan_pembelajaran')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        return { message: 'Kegiatan berhasil dihapus' };
    }

    async generate(userId: string, dto: GenerateKegiatanDto) {
        const alokasi = dto.alokasi_waktu || 90;
        const modelPembelajaran = dto.model_pembelajaran || 'Discovery Learning';

        const systemInstruction = `Kamu adalah ahli pedagogik Indonesia yang menguasai model-model pembelajaran.

Buatkan kegiatan pembelajaran lengkap dengan model ${modelPembelajaran} yang mencakup 3 fase:
1. PENDAHULUAN (±15% waktu): apersepsi, motivasi, tujuan pembelajaran
2. INTI (±70% waktu): sintak model pembelajaran, aktivitas siswa
3. PENUTUP (±15% waktu): kesimpulan, refleksi, tindak lanjut

Untuk setiap fase, sertakan:
- Langkah-langkah detail
- Durasi
- Metode yang digunakan
- Media pembelajaran

Output dalam format JSON dengan struktur:
{
  "pendahuluan": { "durasi": 10, "langkah": [...], "metode": "..." },
  "inti": { "durasi": 65, "langkah": [...], "metode": "..." },
  "penutup": { "durasi": 15, "langkah": [...], "metode": "..." }
}`;

        const prompt = `Buatkan kegiatan pembelajaran untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}
- Model Pembelajaran: ${modelPembelajaran}
- Total Waktu: ${alokasi} menit`;

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

        const kegiatanList: CreateKegiatanDto[] = [];

        // Pendahuluan
        if (konten.pendahuluan) {
            kegiatanList.push({
                nama: 'Kegiatan Pendahuluan',
                fase: FaseKegiatan.PENDAHULUAN,
                durasi: konten.pendahuluan.durasi || Math.round(alokasi * 0.15),
                langkah: konten.pendahuluan.langkah || [],
                metode: konten.pendahuluan.metode || '',
                media: konten.pendahuluan.media || [],
                urutan: 1,
            });
        }

        // Inti
        if (konten.inti) {
            kegiatanList.push({
                nama: 'Kegiatan Inti',
                fase: FaseKegiatan.INTI,
                durasi: konten.inti.durasi || Math.round(alokasi * 0.7),
                langkah: konten.inti.langkah || [],
                metode: konten.inti.metode || modelPembelajaran,
                media: konten.inti.media || [],
                urutan: 1,
            });
        }

        // Penutup
        if (konten.penutup) {
            kegiatanList.push({
                nama: 'Kegiatan Penutup',
                fase: FaseKegiatan.PENUTUP,
                durasi: konten.penutup.durasi || Math.round(alokasi * 0.15),
                langkah: konten.penutup.langkah || [],
                metode: konten.penutup.metode || '',
                media: konten.penutup.media || [],
                urutan: 1,
            });
        }

        if (dto.save_to_db !== false && kegiatanList.length > 0) {
            const saved = await this.createBulk(userId, kegiatanList);
            return {
                model_pembelajaran: modelPembelajaran,
                alokasi_waktu: alokasi,
                kegiatan: saved,
                ai_response: { model: response.model, usage: response.usage },
            };
        }

        return {
            model_pembelajaran: modelPembelajaran,
            alokasi_waktu: alokasi,
            kegiatan: kegiatanList,
            ai_response: { model: response.model, usage: response.usage },
        };
    }
}
