import { Module } from '@nestjs/common';
import { KegiatanController } from './kegiatan.controller';
import { KegiatanService } from './kegiatan.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
    imports: [SupabaseModule, GeminiModule],
    controllers: [KegiatanController],
    providers: [KegiatanService],
    exports: [KegiatanService],
})
export class KegiatanModule { }
