import { Module } from '@nestjs/common';
import { KisiKisiController } from './kisi-kisi.controller';
import { KisiKisiService } from './kisi-kisi.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
    imports: [SupabaseModule, GeminiModule],
    controllers: [KisiKisiController],
    providers: [KisiKisiService],
    exports: [KisiKisiService],
})
export class KisiKisiModule { }
