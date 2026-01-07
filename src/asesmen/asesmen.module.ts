import { Module } from '@nestjs/common';
import { AsesmenController } from './asesmen.controller';
import { AsesmenService } from './asesmen.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
    imports: [SupabaseModule, GeminiModule],
    controllers: [AsesmenController],
    providers: [AsesmenService],
    exports: [AsesmenService],
})
export class AsesmenModule { }
