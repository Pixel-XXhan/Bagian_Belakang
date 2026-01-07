import { Module } from '@nestjs/common';
import { AtpController } from './atp.controller';
import { AtpService } from './atp.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
    imports: [SupabaseModule, GeminiModule],
    controllers: [AtpController],
    providers: [AtpService],
    exports: [AtpService],
})
export class AtpModule { }
