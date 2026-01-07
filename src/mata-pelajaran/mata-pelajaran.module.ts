import { Module } from '@nestjs/common';
import { MataPelajaranController } from './mata-pelajaran.controller';
import { MataPelajaranService } from './mata-pelajaran.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [MataPelajaranController],
    providers: [MataPelajaranService],
    exports: [MataPelajaranService],
})
export class MataPelajaranModule { }
