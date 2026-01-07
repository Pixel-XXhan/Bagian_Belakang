import { IsString, IsOptional, IsUUID, IsArray, IsObject, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMateriDto {
    @ApiProperty({ description: 'Judul materi' })
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

    @ApiPropertyOptional({ description: 'Bab/Unit' })
    @IsOptional()
    @IsString()
    bab?: string;

    @ApiPropertyOptional({ description: 'Ringkasan materi' })
    @IsOptional()
    @IsString()
    ringkasan?: string;

    @ApiPropertyOptional({ description: 'Konten materi (markdown/html)' })
    @IsOptional()
    @IsString()
    konten_text?: string;

    @ApiPropertyOptional({ description: 'Poin-poin penting', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    poin_penting?: string[];

    @ApiPropertyOptional({ description: 'Kata kunci', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    kata_kunci?: string[];

    @ApiPropertyOptional({ description: 'Konten lengkap (JSON)' })
    @IsOptional()
    @IsObject()
    konten?: Record<string, any>;
}

export class UpdateMateriDto extends PartialType(CreateMateriDto) { }

export class GenerateMateriDto {
    @ApiProperty({ description: 'Mata pelajaran' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Topik materi' })
    @IsString()
    topik: string;

    @ApiProperty({ description: 'Kelas' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ description: 'Tingkat kedalaman (dasar/menengah/lanjut)' })
    @IsOptional()
    @IsString()
    tingkat?: string;

    @ApiPropertyOptional({ description: 'Format output (ringkas/lengkap)' })
    @IsOptional()
    @IsString()
    format?: string;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({ description: 'Simpan ke database' })
    @IsOptional()
    save_to_db?: boolean;
}

export class MateriQueryDto {
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
