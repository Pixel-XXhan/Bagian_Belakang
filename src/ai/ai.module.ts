import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { UnifiedAiService } from './unified-ai.service';
import { UnifiedAiController } from './unified-ai.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [ConfigModule, SupabaseModule],
  controllers: [UnifiedAiController],
  providers: [AiService, UnifiedAiService],
  exports: [AiService, UnifiedAiService],
})
export class AiModule { }
