import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMapelDto, UpdateMapelDto, MapelQueryDto } from './dto/mapel.dto';

@Injectable()
export class MataPelajaranService {
    private readonly logger = new Logger(MataPelajaranService.name);

    constructor(private supabaseService: SupabaseService) { }

    /**
     * Get all mata pelajaran with optional filters
     */
    async findAll(query?: MapelQueryDto) {
        let dbQuery = this.supabaseService
            .getClient()
            .from('mata_pelajaran')
            .select(`
        *,
        jenjang:jenjang_id(id, nama, kode),
        kurikulum:kurikulum_id(id, nama, tahun)
      `)
            .order('nama');

        if (query?.jenjang_id) {
            dbQuery = dbQuery.eq('jenjang_id', query.jenjang_id);
        }

        if (query?.kurikulum_id) {
            dbQuery = dbQuery.eq('kurikulum_id', query.kurikulum_id);
        }

        const { data, error } = await dbQuery;

        if (error) {
            this.logger.error('Error fetching mapel:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Get mata pelajaran by ID
     */
    async findOne(id: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('mata_pelajaran')
            .select(`
        *,
        jenjang:jenjang_id(id, nama, kode),
        kurikulum:kurikulum_id(id, nama, tahun)
      `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new NotFoundException(`Mata Pelajaran dengan ID ${id} tidak ditemukan`);
            }
            this.logger.error('Error fetching mapel:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Create mata pelajaran
     */
    async create(dto: CreateMapelDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('mata_pelajaran')
            .insert(dto)
            .select()
            .single();

        if (error) {
            this.logger.error('Error creating mapel:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Update mata pelajaran
     */
    async update(id: string, dto: UpdateMapelDto) {
        await this.findOne(id);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('mata_pelajaran')
            .update(dto)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            this.logger.error('Error updating mapel:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Delete mata pelajaran
     */
    async remove(id: string) {
        await this.findOne(id);

        const { error } = await this.supabaseService
            .getClient()
            .from('mata_pelajaran')
            .delete()
            .eq('id', id);

        if (error) {
            this.logger.error('Error deleting mapel:', error.message);
            throw error;
        }

        return { message: 'Mata Pelajaran berhasil dihapus' };
    }
}
