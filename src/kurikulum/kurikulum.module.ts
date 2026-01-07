import { Module } from '@nestjs/common';
import { KurikulumController } from './kurikulum.controller';
import { KurikulumService } from './kurikulum.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [KurikulumController],
    providers: [KurikulumService],
    exports: [KurikulumService],
})
export class KurikulumModule { }
