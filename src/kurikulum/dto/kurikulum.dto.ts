import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateKurikulumDto {
    @ApiProperty({ description: 'Nama kurikulum', example: 'Kurikulum Merdeka' })
    @IsString()
    nama: string;

    @ApiPropertyOptional({ description: 'Tahun kurikulum', example: 2024 })
    @IsOptional()
    @IsInt()
    tahun?: number;

    @ApiPropertyOptional({ description: 'Deskripsi kurikulum' })
    @IsOptional()
    @IsString()
    deskripsi?: string;

    @ApiPropertyOptional({ description: 'Status aktif', default: true })
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class UpdateKurikulumDto {
    @ApiPropertyOptional({ description: 'Nama kurikulum' })
    @IsOptional()
    @IsString()
    nama?: string;

    @ApiPropertyOptional({ description: 'Tahun kurikulum' })
    @IsOptional()
    @IsInt()
    tahun?: number;

    @ApiPropertyOptional({ description: 'Deskripsi kurikulum' })
    @IsOptional()
    @IsString()
    deskripsi?: string;

    @ApiPropertyOptional({ description: 'Status aktif' })
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}
