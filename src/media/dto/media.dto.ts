import { IsString, IsOptional, IsUUID, IsArray, IsObject, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum JenisMedia {
    VIDEO = 'video',
    GAMBAR = 'gambar',
    AUDIO = 'audio',
    DOKUMEN = 'dokumen',
    PRESENTASI = 'presentasi',
    INTERAKTIF = 'interaktif',
    LINK = 'link',
}

export class CreateMediaDto {
    @ApiProperty({ description: 'Judul media' })
    @IsString()
    judul: string;

    @ApiPropertyOptional({ description: 'ID Mata Pelajaran' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiProperty({ enum: JenisMedia, description: 'Jenis media' })
    @IsEnum(JenisMedia)
    jenis: JenisMedia;

    @ApiPropertyOptional({ description: 'Deskripsi media' })
    @IsOptional()
    @IsString()
    deskripsi?: string;

    @ApiPropertyOptional({ description: 'URL media (video youtube, link, dll)' })
    @IsOptional()
    @IsString()
    url?: string;

    @ApiPropertyOptional({ description: 'Path file di Supabase Storage' })
    @IsOptional()
    @IsString()
    file_path?: string;

    @ApiPropertyOptional({ description: 'Ukuran file dalam bytes' })
    @IsOptional()
    file_size?: number;

    @ApiPropertyOptional({ description: 'Topik/materi terkait', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    topik?: string[];

    @ApiPropertyOptional({ description: 'Kelas yang sesuai', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    kelas?: string[];

    @ApiPropertyOptional({ description: 'Metadata tambahan' })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}

export class UpdateMediaDto extends PartialType(CreateMediaDto) { }

export class GenerateMediaRecommendationDto {
    @ApiProperty({ description: 'Mata pelajaran' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Topik pembelajaran' })
    @IsString()
    topik: string;

    @ApiProperty({ description: 'Kelas' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ description: 'Jenis media yang diinginkan' })
    @IsOptional()
    @IsEnum(JenisMedia)
    jenis?: JenisMedia;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;
}

export class MediaQueryDto {
    @ApiPropertyOptional({ description: 'Filter by mapel ID' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ enum: JenisMedia, description: 'Filter by jenis' })
    @IsOptional()
    @IsEnum(JenisMedia)
    jenis?: JenisMedia;

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
