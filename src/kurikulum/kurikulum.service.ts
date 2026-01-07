import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateKurikulumDto, UpdateKurikulumDto } from './dto/kurikulum.dto';

@Injectable()
export class KurikulumService {
    private readonly logger = new Logger(KurikulumService.name);

    constructor(private supabaseService: SupabaseService) { }

    /**
     * Get all kurikulum
     */
    async findAll(activeOnly = true) {
        let query = this.supabaseService
            .getClient()
            .from('kurikulum')
            .select('*')
            .order('tahun', { ascending: false });

        if (activeOnly) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) {
            this.logger.error('Error fetching kurikulum:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Get kurikulum by ID
     */
    async findOne(id: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('kurikulum')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new NotFoundException(`Kurikulum dengan ID ${id} tidak ditemukan`);
            }
            this.logger.error('Error fetching kurikulum:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Create kurikulum
     */
    async create(dto: CreateKurikulumDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('kurikulum')
            .insert(dto)
            .select()
            .single();

        if (error) {
            this.logger.error('Error creating kurikulum:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Update kurikulum
     */
    async update(id: string, dto: UpdateKurikulumDto) {
        // Check exists
        await this.findOne(id);

        const { data, error } = await this.supabaseService
            .getClient()
            .from('kurikulum')
            .update(dto)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            this.logger.error('Error updating kurikulum:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Delete kurikulum (soft delete by setting is_active to false)
     */
    async remove(id: string) {
        // Check exists
        await this.findOne(id);

        const { error } = await this.supabaseService
            .getClient()
            .from('kurikulum')
            .update({ is_active: false })
            .eq('id', id);

        if (error) {
            this.logger.error('Error deleting kurikulum:', error.message);
            throw error;
        }

        return { message: 'Kurikulum berhasil dihapus' };
    }
}
