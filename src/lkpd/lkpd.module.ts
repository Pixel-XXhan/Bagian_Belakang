import { Module } from '@nestjs/common';
import { LkpdController } from './lkpd.controller';
import { LkpdService } from './lkpd.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
    imports: [SupabaseModule, GeminiModule],
    controllers: [LkpdController],
    providers: [LkpdService],
    exports: [LkpdService],
})
export class LkpdModule { }
