import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateJenjangDto, UpdateJenjangDto } from './dto/jenjang.dto';

@Injectable()
export class JenjangService {
    private readonly logger = new Logger(JenjangService.name);

    constructor(private supabaseService: SupabaseService) { }

    /**
     * Get all jenjang
     */
    async findAll() {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('jenjang')
            .select('*')
            .order('nama');

        if (error) {
            this.logger.error('Error fetching jenjang:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Get jenjang by ID
     */
    async findOne(id: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('jenjang')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new NotFoundException(`Jenjang dengan ID ${id} tidak ditemukan`);
            }
            this.logger.error('Error fetching jenjang:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Get kelas (classes) by jenjang ID
     */
    async getKelasByJenjang(jenjangId: string) {
        // First verify jenjang exists
        await this.findOne(jenjangId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('kelas')
            .select('*')
            .eq('jenjang_id', jenjangId)
            .order('urutan');

        if (error) {
            this.logger.error('Error fetching kelas:', error.message);
            throw error;
        }

        return data || [];
    }

    /**
     * Get mata pelajaran by jenjang ID
     */
    async getMapelByJenjang(jenjangId: string) {
        // First verify jenjang exists
        await this.findOne(jenjangId);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('mata_pelajaran')
            .select('*')
            .eq('jenjang_id', jenjangId)
            .order('nama');

        if (error) {
            this.logger.error('Error fetching mapel:', error.message);
            throw error;
        }

        return data || [];
    }

    /**
     * Create jenjang
     */
    async create(dto: CreateJenjangDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('jenjang')
            .insert(dto)
            .select()
            .single();

        if (error) {
            this.logger.error('Error creating jenjang:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Update jenjang
     */
    async update(id: string, dto: UpdateJenjangDto) {
        await this.findOne(id);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('jenjang')
            .update(dto)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            this.logger.error('Error updating jenjang:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Delete jenjang
     */
    async remove(id: string) {
        await this.findOne(id);

        const { error } = await this.supabaseService
            .getClient()
            .from('jenjang')
            .delete()
            .eq('id', id);

        if (error) {
            this.logger.error('Error deleting jenjang:', error.message);
            throw error;
        }

        return { message: 'Jenjang berhasil dihapus' };
    }
}
