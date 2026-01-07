import { IsString, IsOptional, IsUUID, IsEnum, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TemplateCategory {
    RPP = 'rpp',
    SILABUS = 'silabus',
    MODUL_AJAR = 'modul_ajar',
    LKPD = 'lkpd',
    KISI_KISI = 'kisi_kisi',
    RUBRIK = 'rubrik',
}

export enum TemplateLevel {
    SD = 'SD',
    SMP = 'SMP',
    SMA = 'SMA',
    SMK = 'SMK',
}

export class CreateTemplateDto {
    @ApiProperty({ description: 'Nama template' })
    @IsString()
    nama: string;

    @ApiProperty({ enum: TemplateCategory })
    @IsEnum(TemplateCategory)
    kategori: TemplateCategory;

    @ApiPropertyOptional({ description: 'Mata pelajaran' })
    @IsOptional()
    @IsString()
    mapel?: string;

    @ApiPropertyOptional({ enum: TemplateLevel })
    @IsOptional()
    @IsEnum(TemplateLevel)
    jenjang?: TemplateLevel;

    @ApiPropertyOptional({ description: 'Kelas' })
    @IsOptional()
    @IsString()
    kelas?: string;

    @ApiPropertyOptional({ description: 'Deskripsi template' })
    @IsOptional()
    @IsString()
    deskripsi?: string;

    @ApiProperty({ description: 'Konten template' })
    @IsObject()
    konten: Record<string, any>;

    @ApiPropertyOptional({ description: 'Template publik' })
    @IsOptional()
    @IsBoolean()
    is_public?: boolean;

    @ApiPropertyOptional({ description: 'Template sistem (pre-made)' })
    @IsOptional()
    @IsBoolean()
    is_system?: boolean;
}

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) { }

export class TemplateQueryDto {
    @ApiPropertyOptional({ enum: TemplateCategory })
    @IsOptional()
    @IsEnum(TemplateCategory)
    kategori?: TemplateCategory;

    @ApiPropertyOptional({ enum: TemplateLevel })
    @IsOptional()
    @IsEnum(TemplateLevel)
    jenjang?: TemplateLevel;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    mapel?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    is_public?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    offset?: number;
}

export class UseTemplateDto {
    @ApiProperty({ description: 'ID template yang akan digunakan' })
    @IsUUID()
    template_id: string;

    @ApiPropertyOptional({ description: 'Override data' })
    @IsOptional()
    @IsObject()
    overrides?: Record<string, any>;
}
