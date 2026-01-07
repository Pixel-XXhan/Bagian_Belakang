import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSemesterDto, UpdateSemesterDto } from './dto/semester.dto';

@Injectable()
export class SemesterService {
    private readonly logger = new Logger(SemesterService.name);

    constructor(private supabaseService: SupabaseService) { }

    async findAll() {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('semester')
            .select('*')
            .order('urutan', { ascending: true });

        if (error) throw error;
        return data;
    }

    async findOne(id: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('semester')
            .select('*')
            .eq('id', id)
            .single();

        if (error?.code === 'PGRST116') {
            throw new NotFoundException(`Semester dengan ID ${id} tidak ditemukan`);
        }
        if (error) throw error;
        return data;
    }

    async create(dto: CreateSemesterDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('semester')
            .insert(dto)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, dto: UpdateSemesterDto) {
        await this.findOne(id);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('semester')
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
            .from('semester')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { message: 'Semester berhasil dihapus' };
    }

    async seed() {
        const semesterData = [
            { nama: 'Ganjil', kode: '1', urutan: 1 },
            { nama: 'Genap', kode: '2', urutan: 2 },
        ];

        const { data, error } = await this.supabaseService
            .getClient()
            .from('semester')
            .upsert(semesterData, { onConflict: 'kode' })
            .select();

        if (error) throw error;
        return { message: 'Seed berhasil', count: data.length };
    }
}
