import { Module } from '@nestjs/common';
import { RppController } from './rpp.controller';
import { RppService } from './rpp.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [SupabaseModule, GeminiModule],
  controllers: [RppController],
  providers: [RppService],
  exports: [RppService],
})
export class RppModule { }
