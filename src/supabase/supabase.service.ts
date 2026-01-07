import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;
    private readonly logger = new Logger(SupabaseService.name);

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            this.logger.error('Supabase URL atau Key tidak ditemukan di .env');
            return;
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.logger.log('Supabase Client berhasil diinisialisasi');
    }

    getClient(): SupabaseClient {
        return this.supabase;
    }
}
