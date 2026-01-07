import { IsString, IsOptional, IsUUID, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCapaianPembelajaranDto {
    @ApiProperty({ description: 'Elemen CP' })
    @IsString()
    elemen: string;

    @ApiPropertyOptional({ description: 'ID Mata Pelajaran' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ description: 'Fase (A-F)' })
    @IsOptional()
    @IsString()
    fase?: string;

    @ApiPropertyOptional({ description: 'Deskripsi capaian' })
    @IsOptional()
    @IsString()
    deskripsi?: string;

    @ApiPropertyOptional({ description: 'Sub-elemen', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sub_elemen?: string[];

    @ApiPropertyOptional({ description: 'Konten detail (JSON)' })
    @IsOptional()
    @IsObject()
    konten?: Record<string, any>;
}

export class UpdateCapaianPembelajaranDto extends PartialType(CreateCapaianPembelajaranDto) { }

export class GetCapaianPembelajaranDto {
    @ApiProperty({ description: 'Mata pelajaran' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Fase (A-F)' })
    @IsString()
    fase: string;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;
}

export class CapaianPembelajaranQueryDto {
    @ApiPropertyOptional({ description: 'Filter by mapel ID' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ description: 'Filter by fase' })
    @IsOptional()
    @IsString()
    fase?: string;

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
