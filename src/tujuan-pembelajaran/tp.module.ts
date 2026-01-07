import { Module } from '@nestjs/common';
import { TujuanPembelajaranController } from './tp.controller';
import { TujuanPembelajaranService } from './tp.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
    imports: [SupabaseModule, GeminiModule],
    controllers: [TujuanPembelajaranController],
    providers: [TujuanPembelajaranService],
    exports: [TujuanPembelajaranService],
})
export class TujuanPembelajaranModule { }
