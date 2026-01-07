import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJenjangDto {
    @ApiProperty({ description: 'Nama jenjang pendidikan', example: 'SMA' })
    @IsString()
    nama: string;

    @ApiPropertyOptional({ description: 'Kode jenjang', example: 'SMA' })
    @IsOptional()
    @IsString()
    kode?: string;
}

export class UpdateJenjangDto {
    @ApiPropertyOptional({ description: 'Nama jenjang pendidikan' })
    @IsOptional()
    @IsString()
    nama?: string;

    @ApiPropertyOptional({ description: 'Kode jenjang' })
    @IsOptional()
    @IsString()
    kode?: string;
}

export class JenjangResponse {
    @ApiProperty()
    id: string;

    @ApiProperty()
    nama: string;

    @ApiPropertyOptional()
    kode?: string;
}
