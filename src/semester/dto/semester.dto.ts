import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSemesterDto {
    @ApiProperty({ description: 'Nama semester (Ganjil/Genap atau 1/2)' })
    @IsString()
    nama: string;

    @ApiPropertyOptional({ description: 'Kode semester' })
    @IsOptional()
    @IsString()
    kode?: string;

    @ApiPropertyOptional({ description: 'Urutan' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    urutan?: number;
}

export class UpdateSemesterDto extends PartialType(CreateSemesterDto) { }
