import { IsString, IsOptional, IsUUID, IsArray, IsObject, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLkpdDto {
    @ApiProperty({ description: 'Judul LKPD', example: 'LKPD Pengukuran Sudut' })
    @IsString()
    judul: string;

    @ApiPropertyOptional({ description: 'ID Mata Pelajaran' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ description: 'Kelas' })
    @IsOptional()
    @IsString()
    kelas?: string;

    @ApiPropertyOptional({ description: 'Kompetensi dasar' })
    @IsOptional()
    @IsString()
    kompetensi_dasar?: string;

    @ApiPropertyOptional({ description: 'Tujuan pembelajaran', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tujuan_pembelajaran?: string[];

    @ApiPropertyOptional({ description: 'Petunjuk pengerjaan' })
    @IsOptional()
    @IsString()
    petunjuk?: string;

    @ApiPropertyOptional({ description: 'Langkah kegiatan', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    langkah_kegiatan?: string[];

    @ApiPropertyOptional({ description: 'Soal/pertanyaan', type: Object })
    @IsOptional()
    @IsObject()
    soal?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Konten lengkap (JSON)' })
    @IsOptional()
    @IsObject()
    konten?: Record<string, any>;
}

export class UpdateLkpdDto extends PartialType(CreateLkpdDto) { }

export class GenerateLkpdDto {
    @ApiProperty({ description: 'Mata pelajaran', example: 'Matematika' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Topik/materi', example: 'Pengukuran Sudut' })
    @IsString()
    topik: string;

    @ApiProperty({ description: 'Kelas', example: 'X SMA' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ description: 'Jenis kegiatan (individu/kelompok)' })
    @IsOptional()
    @IsString()
    jenis_kegiatan?: string;

    @ApiPropertyOptional({ description: 'Durasi pengerjaan (menit)' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    durasi?: number;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({ description: 'Simpan ke database' })
    @IsOptional()
    save_to_db?: boolean;
}

export class LkpdQueryDto {
    @ApiPropertyOptional({ description: 'Filter by mapel ID' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ description: 'Filter by kelas' })
    @IsOptional()
    @IsString()
    kelas?: string;

    @ApiPropertyOptional({ description: 'Search' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    offset?: number;
}
