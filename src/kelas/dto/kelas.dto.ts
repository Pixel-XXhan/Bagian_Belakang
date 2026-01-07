import { IsString, IsOptional, IsInt, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateKelasDto {
    @ApiProperty({ description: 'Nama kelas (1-12 atau X-XII)' })
    @IsString()
    nama: string;

    @ApiPropertyOptional({ description: 'Kode kelas' })
    @IsOptional()
    @IsString()
    kode?: string;

    @ApiPropertyOptional({ description: 'Urutan untuk sorting' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    urutan?: number;

    @ApiPropertyOptional({ description: 'Jenjang (SD/SMP/SMA/SMK)' })
    @IsOptional()
    @IsString()
    jenjang?: string;
}

export class UpdateKelasDto extends PartialType(CreateKelasDto) { }

export class KelasQueryDto {
    @ApiPropertyOptional({ description: 'Filter by jenjang' })
    @IsOptional()
    @IsString()
    jenjang?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    offset?: number;
}
