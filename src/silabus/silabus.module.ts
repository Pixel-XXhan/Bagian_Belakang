import { Module } from '@nestjs/common';
import { SilabusController } from './silabus.controller';
import { SilabusService } from './silabus.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
    imports: [SupabaseModule, GeminiModule],
    controllers: [SilabusController],
    providers: [SilabusService],
    exports: [SilabusService],
})
export class SilabusModule { }
