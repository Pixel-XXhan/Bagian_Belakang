import { Module } from '@nestjs/common';
import { RubrikController } from './rubrik.controller';
import { RubrikService } from './rubrik.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
    imports: [SupabaseModule, GeminiModule],
    controllers: [RubrikController],
    providers: [RubrikService],
    exports: [RubrikService],
})
export class RubrikModule { }
