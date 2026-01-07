import { IsString, IsOptional, IsUUID, IsArray, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum JenisBahanAjar {
    HANDOUT = 'handout',
    BUKU = 'buku',
    MODUL = 'modul',
    BROSUR = 'brosur',
    LEMBAR_INFO = 'lembar_info',
    POSTER = 'poster',
    INFOGRAFIS = 'infografis',
}

export class CreateBahanAjarDto {
    @ApiProperty({ description: 'Judul bahan ajar' })
    @IsString()
    judul: string;

    @ApiPropertyOptional({ description: 'ID Mata Pelajaran' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiProperty({ enum: JenisBahanAjar, description: 'Jenis bahan ajar' })
    @IsEnum(JenisBahanAjar)
    jenis: JenisBahanAjar;

    @ApiPropertyOptional({ description: 'Kelas' })
    @IsOptional()
    @IsString()
    kelas?: string;

    @ApiPropertyOptional({ description: 'Deskripsi' })
    @IsOptional()
    @IsString()
    deskripsi?: string;

    @ApiPropertyOptional({ description: 'Tujuan bahan ajar' })
    @IsOptional()
    @IsString()
    tujuan?: string;

    @ApiPropertyOptional({ description: 'Konten teks (markdown/html)' })
    @IsOptional()
    @IsString()
    konten_text?: string;

    @ApiPropertyOptional({ description: 'File path di Supabase Storage' })
    @IsOptional()
    @IsString()
    file_path?: string;

    @ApiPropertyOptional({ description: 'Konten lengkap (JSON)' })
    @IsOptional()
    @IsObject()
    konten?: Record<string, any>;
}

export class UpdateBahanAjarDto extends PartialType(CreateBahanAjarDto) { }

export class GenerateBahanAjarDto {
    @ApiProperty({ description: 'Mata pelajaran' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Topik' })
    @IsString()
    topik: string;

    @ApiProperty({ description: 'Kelas' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ enum: JenisBahanAjar, description: 'Jenis bahan ajar' })
    @IsOptional()
    @IsEnum(JenisBahanAjar)
    jenis?: JenisBahanAjar;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({ description: 'Simpan ke database' })
    @IsOptional()
    save_to_db?: boolean;
}

export class BahanAjarQueryDto {
    @ApiPropertyOptional({ description: 'Filter by mapel ID' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ enum: JenisBahanAjar })
    @IsOptional()
    @IsEnum(JenisBahanAjar)
    jenis?: JenisBahanAjar;

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
