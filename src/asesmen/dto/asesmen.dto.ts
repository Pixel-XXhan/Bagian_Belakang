import { IsString, IsOptional, IsUUID, IsArray, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum JenisAsesmen {
    DIAGNOSTIK = 'diagnostik',
    FORMATIF = 'formatif',
    SUMATIF = 'sumatif',
}

export class CreateAsesmenDto {
    @ApiProperty({ enum: JenisAsesmen, description: 'Jenis asesmen' })
    @IsEnum(JenisAsesmen)
    jenis: JenisAsesmen;

    @ApiProperty({ description: 'Judul asesmen', example: 'Asesmen Sumatif Bab 3' })
    @IsString()
    judul: string;

    @ApiPropertyOptional({ description: 'ID Mata Pelajaran' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ description: 'Kelas', example: 'X' })
    @IsOptional()
    @IsString()
    kelas?: string;

    @ApiPropertyOptional({ description: 'IDs soal dari bank soal', type: [String] })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    soal_ids?: string[];

    @ApiPropertyOptional({ description: 'Rubrik penilaian (JSON)' })
    @IsOptional()
    @IsObject()
    rubrik?: Record<string, any>;
}

export class UpdateAsesmenDto extends PartialType(CreateAsesmenDto) { }

export class GenerateAsesmenDto {
    @ApiProperty({ enum: JenisAsesmen, description: 'Jenis asesmen' })
    @IsEnum(JenisAsesmen)
    jenis: JenisAsesmen;

    @ApiProperty({ description: 'Mata pelajaran', example: 'Matematika' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Topik/materi', example: 'Pengukuran Sudut' })
    @IsString()
    topik: string;

    @ApiProperty({ description: 'Kelas', example: 'X SMA' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ description: 'Jumlah soal untuk asesmen', default: 10 })
    @IsOptional()
    jumlah_soal?: number;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({ description: 'Simpan ke database', default: true })
    @IsOptional()
    save_to_db?: boolean;
}

export class AsesmenQueryDto {
    @ApiPropertyOptional({ enum: JenisAsesmen })
    @IsOptional()
    @IsEnum(JenisAsesmen)
    jenis?: JenisAsesmen;

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
