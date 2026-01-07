import { Module } from '@nestjs/common';
import { KompetensiDasarController } from './kd.controller';
import { KompetensiDasarService } from './kd.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
    imports: [SupabaseModule, GeminiModule],
    controllers: [KompetensiDasarController],
    providers: [KompetensiDasarService],
    exports: [KompetensiDasarService],
})
export class KompetensiDasarModule { }
