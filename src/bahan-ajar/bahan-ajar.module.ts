import { Module } from '@nestjs/common';
import { BahanAjarController } from './bahan-ajar.controller';
import { BahanAjarService } from './bahan-ajar.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
    imports: [SupabaseModule, GeminiModule],
    controllers: [BahanAjarController],
    providers: [BahanAjarService],
    exports: [BahanAjarService],
})
export class BahanAjarModule { }
