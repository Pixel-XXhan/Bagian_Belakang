import { Module } from '@nestjs/common';
import { JenjangController } from './jenjang.controller';
import { JenjangService } from './jenjang.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [JenjangController],
    providers: [JenjangService],
    exports: [JenjangService],
})
export class JenjangModule { }
