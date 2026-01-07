import { IsString, IsOptional, IsUUID, IsArray, IsObject, IsEnum, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum FaseKegiatan {
    PENDAHULUAN = 'pendahuluan',
    INTI = 'inti',
    PENUTUP = 'penutup',
}

export class CreateKegiatanDto {
    @ApiProperty({ description: 'Nama kegiatan' })
    @IsString()
    nama: string;

    @ApiPropertyOptional({ description: 'ID RPP terkait' })
    @IsOptional()
    @IsUUID()
    rpp_id?: string;

    @ApiProperty({ enum: FaseKegiatan, description: 'Fase kegiatan' })
    @IsEnum(FaseKegiatan)
    fase: FaseKegiatan;

    @ApiPropertyOptional({ description: 'Durasi (menit)' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    durasi?: number;

    @ApiPropertyOptional({ description: 'Deskripsi kegiatan' })
    @IsOptional()
    @IsString()
    deskripsi?: string;

    @ApiPropertyOptional({ description: 'Langkah-langkah', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    langkah?: string[];

    @ApiPropertyOptional({ description: 'Metode pembelajaran' })
    @IsOptional()
    @IsString()
    metode?: string;

    @ApiPropertyOptional({ description: 'Media yang digunakan', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    media?: string[];

    @ApiPropertyOptional({ description: 'Urutan dalam fase' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    urutan?: number;
}

export class UpdateKegiatanDto extends PartialType(CreateKegiatanDto) { }

export class GenerateKegiatanDto {
    @ApiProperty({ description: 'Mata pelajaran' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Topik/materi' })
    @IsString()
    topik: string;

    @ApiProperty({ description: 'Kelas' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ description: 'Model pembelajaran (PBL, PjBL, Discovery, dll)' })
    @IsOptional()
    @IsString()
    model_pembelajaran?: string;

    @ApiPropertyOptional({ description: 'Total alokasi waktu (menit)', default: 90 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    alokasi_waktu?: number;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({ description: 'Simpan ke database' })
    @IsOptional()
    save_to_db?: boolean;
}

export class KegiatanQueryDto {
    @ApiPropertyOptional({ description: 'Filter by RPP ID' })
    @IsOptional()
    @IsUUID()
    rpp_id?: string;

    @ApiPropertyOptional({ enum: FaseKegiatan })
    @IsOptional()
    @IsEnum(FaseKegiatan)
    fase?: FaseKegiatan;

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
