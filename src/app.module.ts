import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AiModule } from './ai/ai.module';
import { RppModule } from './rpp/rpp.module';
import { AuthModule } from './auth/auth.module';
import { GeminiModule } from './gemini/gemini.module';
import { OpenRouterModule } from './openrouter/openrouter.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { KurikulumModule } from './kurikulum/kurikulum.module';
import { JenjangModule } from './jenjang/jenjang.module';
import { MataPelajaranModule } from './mata-pelajaran/mata-pelajaran.module';
import { KelasModule } from './kelas/kelas.module';
import { SemesterModule } from './semester/semester.module';
import { KompetensiDasarModule } from './kompetensi-dasar/kd.module';
import { SilabusModule } from './silabus/silabus.module';
import { ExportModule } from './export/export.module';
import { ModulAjarModule } from './modul-ajar/modul-ajar.module';
import { BankSoalModule } from './bank-soal/bank-soal.module';
import { AsesmenModule } from './asesmen/asesmen.module';
import { LkpdModule } from './lkpd/lkpd.module';
import { AtpModule } from './atp/atp.module';
import { KisiKisiModule } from './kisi-kisi/kisi-kisi.module';
import { RubrikModule } from './rubrik/rubrik.module';
import { MateriModule } from './materi/materi.module';
import { MediaModule } from './media/media.module';
import { TujuanPembelajaranModule } from './tujuan-pembelajaran/tp.module';
import { BahanAjarModule } from './bahan-ajar/bahan-ajar.module';
import { KegiatanModule } from './kegiatan/kegiatan.module';
import { CapaianPembelajaranModule } from './capaian-pembelajaran/cp.module';
import { TemplateModule } from './template/template.module';
import { SuggestionsModule } from './suggestions/suggestions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    SupabaseModule,
    AiModule,
    AuthModule,
    GeminiModule,
    OpenRouterModule,
    HealthModule,
    // Master Data
    UserProfileModule,
    KurikulumModule,
    JenjangModule,
    MataPelajaranModule,
    KelasModule,
    SemesterModule,
    KompetensiDasarModule,
    // Curriculum Planning
    CapaianPembelajaranModule,
    AtpModule,
    TujuanPembelajaranModule,
    // Document Generation
    RppModule,
    SilabusModule,
    ModulAjarModule,
    LkpdModule,
    KegiatanModule,
    ExportModule,
    // Teaching Materials
    MateriModule,
    MediaModule,
    BahanAjarModule,
    // Assessment
    BankSoalModule,
    AsesmenModule,
    KisiKisiModule,
    RubrikModule,
    // Advanced Features
    TemplateModule,
    SuggestionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
