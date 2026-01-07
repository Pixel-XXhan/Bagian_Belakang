import { Module } from '@nestjs/common';
import { BankSoalController } from './bank-soal.controller';
import { BankSoalService } from './bank-soal.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
    imports: [SupabaseModule, GeminiModule],
    controllers: [BankSoalController],
    providers: [BankSoalService],
    exports: [BankSoalService],
})
export class BankSoalModule { }
