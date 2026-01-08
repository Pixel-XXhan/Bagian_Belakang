import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;
    private supabaseAdmin: SupabaseClient; // Service role client for admin ops
    private readonly logger = new Logger(SupabaseService.name);

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
        const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            this.logger.error('Supabase URL atau Key tidak ditemukan di .env');
            return;
        }

        // Regular client (for RLS-respecting operations)
        this.supabase = createClient(supabaseUrl, supabaseKey);

        // Admin client (for storage/bucket operations - bypasses RLS)
        if (serviceKey) {
            this.supabaseAdmin = createClient(supabaseUrl, serviceKey);
            this.logger.log('Supabase Admin Client (service_role) diinisialisasi');
        } else {
            this.supabaseAdmin = this.supabase; // Fallback to regular client
            this.logger.warn('SUPABASE_SERVICE_KEY tidak ada, storage mungkin tidak berfungsi');
        }

        this.logger.log('Supabase Client berhasil diinisialisasi');
    }

    /**
     * Get regular Supabase client (respects RLS)
     */
    getClient(): SupabaseClient {
        return this.supabase;
    }

    /**
     * Get admin Supabase client (bypasses RLS, for storage operations)
     */
    getAdminClient(): SupabaseClient {
        return this.supabaseAdmin;
    }
}
