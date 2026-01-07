import { Module } from '@nestjs/common';
import { ModulAjarController } from './modul-ajar.controller';
import { ModulAjarService } from './modul-ajar.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
    imports: [SupabaseModule, GeminiModule],
    controllers: [ModulAjarController],
    providers: [ModulAjarService],
    exports: [ModulAjarService],
})
export class ModulAjarModule { }
