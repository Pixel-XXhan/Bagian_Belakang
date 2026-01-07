import { IsString, IsOptional, IsUUID, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateKompetensiDasarDto {
    @ApiProperty({ description: 'Kode KD (misal: 3.1, 4.1)' })
    @IsString()
    kode: string;

    @ApiProperty({ description: 'Deskripsi KD' })
    @IsString()
    deskripsi: string;

    @ApiPropertyOptional({ description: 'ID Mata Pelajaran' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ description: 'Kelas' })
    @IsOptional()
    @IsString()
    kelas?: string;

    @ApiPropertyOptional({ description: 'Aspek (Pengetahuan/Keterampilan)' })
    @IsOptional()
    @IsString()
    aspek?: string;

    @ApiPropertyOptional({ description: 'Indikator', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    indikator?: string[];
}

export class UpdateKompetensiDasarDto extends PartialType(CreateKompetensiDasarDto) { }

export class GenerateKDDto {
    @ApiProperty({ description: 'Mata pelajaran' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Kelas' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ description: 'Kurikulum' })
    @IsOptional()
    @IsString()
    kurikulum?: string;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;
}

export class KDQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    kelas?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    aspek?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    offset?: number;
}
