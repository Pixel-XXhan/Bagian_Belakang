import { Module } from '@nestjs/common';
import { CapaianPembelajaranController } from './cp.controller';
import { CapaianPembelajaranService } from './cp.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
    imports: [SupabaseModule, GeminiModule],
    controllers: [CapaianPembelajaranController],
    providers: [CapaianPembelajaranService],
    exports: [CapaianPembelajaranService],
})
export class CapaianPembelajaranModule { }
