import { IsString, IsOptional, IsUUID, IsArray, IsObject, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class KriteriaDto {
    @ApiProperty({ description: 'Nama kriteria' })
    @IsString()
    kriteria: string;

    @ApiProperty({ description: 'Bobot nilai' })
    @IsInt()
    bobot: number;

    @ApiPropertyOptional({ description: 'Deskripsi per level', type: Object })
    @IsOptional()
    @IsObject()
    level_deskripsi?: Record<string, string>;
}

export class CreateRubrikDto {
    @ApiProperty({ description: 'Judul rubrik' })
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

    @ApiPropertyOptional({ description: 'Jenis penilaian (kinerja/proyek/produk/portofolio)' })
    @IsOptional()
    @IsString()
    jenis_penilaian?: string;

    @ApiPropertyOptional({ description: 'Skala penilaian (1-4, 1-100, dll)' })
    @IsOptional()
    @IsString()
    skala?: string;

    @ApiPropertyOptional({ description: 'Kriteria penilaian', type: Object })
    @IsOptional()
    @IsObject()
    kriteria?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Konten lengkap (JSON)' })
    @IsOptional()
    @IsObject()
    konten?: Record<string, any>;
}

export class UpdateRubrikDto extends PartialType(CreateRubrikDto) { }

export class GenerateRubrikDto {
    @ApiProperty({ description: 'Mata pelajaran' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Topik/tugas yang dinilai' })
    @IsString()
    topik: string;

    @ApiProperty({ description: 'Kelas' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ description: 'Jenis penilaian' })
    @IsOptional()
    @IsString()
    jenis_penilaian?: string;

    @ApiPropertyOptional({ description: 'Jumlah kriteria', default: 4 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    jumlah_kriteria?: number;

    @ApiPropertyOptional({ description: 'Jumlah level (skala)', default: 4 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    jumlah_level?: number;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({ description: 'Simpan ke database' })
    @IsOptional()
    save_to_db?: boolean;
}

export class RubrikQueryDto {
    @ApiPropertyOptional({ description: 'Filter by mapel ID' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ description: 'Filter by jenis penilaian' })
    @IsOptional()
    @IsString()
    jenis_penilaian?: string;

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
