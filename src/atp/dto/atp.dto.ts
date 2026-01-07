import { IsString, IsOptional, IsUUID, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAtpDto {
    @ApiProperty({ description: 'Judul ATP', example: 'ATP Matematika Fase E' })
    @IsString()
    judul: string;

    @ApiPropertyOptional({ description: 'ID Capaian Pembelajaran' })
    @IsOptional()
    @IsUUID()
    cp_id?: string;

    @ApiPropertyOptional({ description: 'ID Mata Pelajaran' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ description: 'Fase', example: 'E' })
    @IsOptional()
    @IsString()
    fase?: string;

    @ApiPropertyOptional({ description: 'Kelas' })
    @IsOptional()
    @IsString()
    kelas?: string;

    @ApiPropertyOptional({ description: 'Tujuan pembelajaran', type: Object })
    @IsOptional()
    @IsObject()
    tujuan_pembelajaran?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Konten lengkap ATP (JSON)' })
    @IsOptional()
    @IsObject()
    konten?: Record<string, any>;
}

export class UpdateAtpDto extends PartialType(CreateAtpDto) { }

export class GenerateAtpDto {
    @ApiProperty({ description: 'Mata pelajaran', example: 'Matematika' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Fase', example: 'E' })
    @IsString()
    fase: string;

    @ApiPropertyOptional({ description: 'Kelas' })
    @IsOptional()
    @IsString()
    kelas?: string;

    @ApiPropertyOptional({ description: 'Elemen yang difokuskan' })
    @IsOptional()
    @IsString()
    elemen?: string;

    @ApiPropertyOptional({ description: 'Jumlah minggu/pertemuan' })
    @IsOptional()
    jumlah_minggu?: number;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({ description: 'Simpan ke database' })
    @IsOptional()
    save_to_db?: boolean;
}

export class AtpQueryDto {
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
