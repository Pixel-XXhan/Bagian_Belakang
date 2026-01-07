import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
    CreateTemplateDto,
    UpdateTemplateDto,
    TemplateQueryDto,
    UseTemplateDto,
    TemplateCategory
} from './dto/template.dto';

@Injectable()
export class TemplateService {
    private readonly logger = new Logger(TemplateService.name);

    constructor(private supabaseService: SupabaseService) { }

    async findAll(userId: string, query?: TemplateQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('template')
            .select('*')
            .or(`user_id.eq.${userId},is_public.eq.true,is_system.eq.true`)
            .order('created_at', { ascending: false });

        if (query?.kategori) dbQuery = dbQuery.eq('kategori', query.kategori);
        if (query?.jenjang) dbQuery = dbQuery.eq('jenjang', query.jenjang);
        if (query?.mapel) dbQuery = dbQuery.ilike('mapel', `%${query.mapel}%`);
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
            .from('template')
            .select('*')
            .eq('id', id)
            .or(`user_id.eq.${userId},is_public.eq.true,is_system.eq.true`)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`Template dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async findByCategory(kategori: TemplateCategory, userId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('template')
            .select('*')
            .eq('kategori', kategori)
            .or(`user_id.eq.${userId},is_public.eq.true,is_system.eq.true`)
            .order('nama', { ascending: true });

        if (error) throw error;
        return data;
    }

    async create(userId: string, dto: CreateTemplateDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('template')
            .insert({ ...dto, user_id: userId })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, userId: string, dto: UpdateTemplateDto) {
        const template = await this.findOne(id, userId);
        if (template.user_id !== userId && !template.is_system) {
            throw new NotFoundException('Tidak dapat mengubah template milik orang lain');
        }

        const { data, error } = await this.supabaseService
            .getClient()
            .from('template')
            .update({ ...dto, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async remove(id: string, userId: string) {
        const template = await this.findOne(id, userId);
        if (template.user_id !== userId) {
            throw new NotFoundException('Tidak dapat menghapus template milik orang lain');
        }

        const { error } = await this.supabaseService
            .getClient()
            .from('template')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { message: 'Template berhasil dihapus' };
    }

    async useTemplate(userId: string, dto: UseTemplateDto) {
        const template = await this.findOne(dto.template_id, userId);

        // Merge template content with overrides
        const mergedContent = {
            ...template.konten,
            ...(dto.overrides || {}),
            _from_template: {
                id: template.id,
                nama: template.nama,
            },
        };

        return {
            template_id: template.id,
            template_nama: template.nama,
            kategori: template.kategori,
            konten: mergedContent,
        };
    }

    async getStatistics(userId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('template')
            .select('kategori, is_system, is_public')
            .or(`user_id.eq.${userId},is_public.eq.true,is_system.eq.true`);

        if (error) throw error;

        const stats = {
            total: data.length,
            by_kategori: {} as Record<string, number>,
            system_templates: 0,
            public_templates: 0,
            my_templates: 0,
        };

        data.forEach((item: any) => {
            stats.by_kategori[item.kategori] = (stats.by_kategori[item.kategori] || 0) + 1;
            if (item.is_system) stats.system_templates++;
            if (item.is_public) stats.public_templates++;
        });

        return stats;
    }

    async seedDefaultTemplates() {
        const defaultTemplates = [
            {
                nama: 'RPP Matematika - Aljabar Dasar',
                kategori: 'rpp',
                mapel: 'Matematika',
                jenjang: 'SMA',
                kelas: 'X',
                deskripsi: 'Template RPP untuk materi aljabar dasar',
                is_system: true,
                is_public: true,
                konten: {
                    identitas: {
                        satuan_pendidikan: '[Nama Sekolah]',
                        mata_pelajaran: 'Matematika',
                        kelas_semester: 'X/1',
                        alokasi_waktu: '2 x 45 menit',
                    },
                    tujuan_pembelajaran: [
                        'Peserta didik dapat memahami konsep variabel dan konstanta',
                        'Peserta didik dapat menyelesaikan persamaan linear satu variabel',
                    ],
                    kegiatan: {
                        pendahuluan: ['Salam dan doa', 'Apersepsi', 'Motivasi'],
                        inti: ['Eksplorasi konsep', 'Diskusi kelompok', 'Latihan soal'],
                        penutup: ['Kesimpulan', 'Refleksi', 'Tugas'],
                    },
                },
            },
            {
                nama: 'RPP Bahasa Indonesia - Teks Eksposisi',
                kategori: 'rpp',
                mapel: 'Bahasa Indonesia',
                jenjang: 'SMA',
                kelas: 'X',
                deskripsi: 'Template RPP untuk materi teks eksposisi',
                is_system: true,
                is_public: true,
                konten: {
                    identitas: {
                        satuan_pendidikan: '[Nama Sekolah]',
                        mata_pelajaran: 'Bahasa Indonesia',
                        kelas_semester: 'X/1',
                        alokasi_waktu: '2 x 45 menit',
                    },
                    tujuan_pembelajaran: [
                        'Peserta didik dapat mengidentifikasi struktur teks eksposisi',
                        'Peserta didik dapat menulis teks eksposisi',
                    ],
                    kegiatan: {
                        pendahuluan: ['Salam', 'Apersepsi tentang teks', 'Tujuan pembelajaran'],
                        inti: ['Membaca contoh teks', 'Analisis struktur', 'Menulis teks'],
                        penutup: ['Presentasi', 'Refleksi', 'Penugasan'],
                    },
                },
            },
            {
                nama: 'LKPD Praktikum IPA',
                kategori: 'lkpd',
                mapel: 'IPA',
                jenjang: 'SMP',
                kelas: 'VIII',
                deskripsi: 'Template LKPD untuk praktikum IPA',
                is_system: true,
                is_public: true,
                konten: {
                    judul: '[Judul Praktikum]',
                    tujuan: ['Tujuan 1', 'Tujuan 2'],
                    alat_bahan: ['Alat 1', 'Bahan 1'],
                    langkah_kerja: ['Langkah 1', 'Langkah 2', 'Langkah 3'],
                    tabel_pengamatan: { kolom: ['No', 'Pengamatan', 'Hasil'] },
                    pertanyaan: ['Pertanyaan 1?', 'Pertanyaan 2?'],
                    kesimpulan: '[Isi kesimpulan]',
                },
            },
            {
                nama: 'Rubrik Penilaian Presentasi',
                kategori: 'rubrik',
                mapel: 'Umum',
                jenjang: 'SMA',
                deskripsi: 'Template rubrik penilaian presentasi',
                is_system: true,
                is_public: true,
                konten: {
                    jenis: 'keterampilan',
                    skala: '1-4',
                    kriteria: [
                        {
                            aspek: 'Konten/Materi',
                            bobot: 30,
                            deskriptor: {
                                '1': 'Materi tidak sesuai topik',
                                '2': 'Materi kurang lengkap',
                                '3': 'Materi cukup lengkap',
                                '4': 'Materi sangat lengkap dan mendalam',
                            },
                        },
                        {
                            aspek: 'Penyampaian',
                            bobot: 25,
                            deskriptor: {
                                '1': 'Tidak jelas dan terbata-bata',
                                '2': 'Kurang jelas',
                                '3': 'Cukup jelas',
                                '4': 'Sangat jelas dan lancar',
                            },
                        },
                        {
                            aspek: 'Media/Visual',
                            bobot: 25,
                            deskriptor: {
                                '1': 'Tidak menggunakan media',
                                '2': 'Media kurang menarik',
                                '3': 'Media cukup menarik',
                                '4': 'Media sangat menarik dan informatif',
                            },
                        },
                        {
                            aspek: 'Tanya Jawab',
                            bobot: 20,
                            deskriptor: {
                                '1': 'Tidak dapat menjawab',
                                '2': 'Jawaban kurang tepat',
                                '3': 'Jawaban cukup tepat',
                                '4': 'Jawaban sangat tepat dan mendalam',
                            },
                        },
                    ],
                },
            },
        ];

        const { data, error } = await this.supabaseService
            .getClient()
            .from('template')
            .upsert(defaultTemplates, { onConflict: 'nama' })
            .select();

        if (error) throw error;
        return { message: 'Seed berhasil', count: data.length, templates: data };
    }
}
