import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateKelasDto, UpdateKelasDto, KelasQueryDto } from './dto/kelas.dto';

@Injectable()
export class KelasService {
    private readonly logger = new Logger(KelasService.name);

    constructor(private supabaseService: SupabaseService) { }

    async findAll(query?: KelasQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('kelas')
            .select('*')
            .order('urutan', { ascending: true });

        if (query?.jenjang) dbQuery = dbQuery.eq('jenjang', query.jenjang);
        if (query?.limit) dbQuery = dbQuery.limit(query.limit);
        if (query?.offset) dbQuery = dbQuery.range(query.offset, query.offset + (query.limit || 10) - 1);

        const { data, error } = await dbQuery;
        if (error) throw error;
        return data;
    }

    async findOne(id: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('kelas')
            .select('*')
            .eq('id', id)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`Kelas dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async create(dto: CreateKelasDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('kelas')
            .insert(dto)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, dto: UpdateKelasDto) {
        await this.findOne(id);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('kelas')
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
            .from('kelas')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { message: 'Kelas berhasil dihapus' };
    }

    async seed() {
        const kelasData = [
            // SD
            { nama: '1', kode: '1', jenjang: 'SD', urutan: 1 },
            { nama: '2', kode: '2', jenjang: 'SD', urutan: 2 },
            { nama: '3', kode: '3', jenjang: 'SD', urutan: 3 },
            { nama: '4', kode: '4', jenjang: 'SD', urutan: 4 },
            { nama: '5', kode: '5', jenjang: 'SD', urutan: 5 },
            { nama: '6', kode: '6', jenjang: 'SD', urutan: 6 },
            // SMP
            { nama: '7', kode: '7', jenjang: 'SMP', urutan: 7 },
            { nama: '8', kode: '8', jenjang: 'SMP', urutan: 8 },
            { nama: '9', kode: '9', jenjang: 'SMP', urutan: 9 },
            // SMA
            { nama: 'X', kode: '10', jenjang: 'SMA', urutan: 10 },
            { nama: 'XI', kode: '11', jenjang: 'SMA', urutan: 11 },
            { nama: 'XII', kode: '12', jenjang: 'SMA', urutan: 12 },
        ];

        const { data, error } = await this.supabaseService
            .getClient()
            .from('kelas')
            .upsert(kelasData, { onConflict: 'kode' })
            .select();

        if (error) throw error;
        return { message: 'Seed berhasil', count: data.length };
    }
}
