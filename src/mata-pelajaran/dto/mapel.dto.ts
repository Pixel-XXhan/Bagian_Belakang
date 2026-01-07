import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMapelDto {
    @ApiProperty({ description: 'Nama mata pelajaran', example: 'Matematika' })
    @IsString()
    nama: string;

    @ApiPropertyOptional({ description: 'Kode mata pelajaran', example: 'MTK' })
    @IsOptional()
    @IsString()
    kode?: string;

    @ApiPropertyOptional({ description: 'ID jenjang pendidikan' })
    @IsOptional()
    @IsUUID()
    jenjang_id?: string;

    @ApiPropertyOptional({ description: 'ID kurikulum' })
    @IsOptional()
    @IsUUID()
    kurikulum_id?: string;
}

export class UpdateMapelDto {
    @ApiPropertyOptional({ description: 'Nama mata pelajaran' })
    @IsOptional()
    @IsString()
    nama?: string;

    @ApiPropertyOptional({ description: 'Kode mata pelajaran' })
    @IsOptional()
    @IsString()
    kode?: string;

    @ApiPropertyOptional({ description: 'ID jenjang pendidikan' })
    @IsOptional()
    @IsUUID()
    jenjang_id?: string;

    @ApiPropertyOptional({ description: 'ID kurikulum' })
    @IsOptional()
    @IsUUID()
    kurikulum_id?: string;
}

export class MapelQueryDto {
    @ApiPropertyOptional({ description: 'Filter by jenjang ID' })
    @IsOptional()
    @IsUUID()
    jenjang_id?: string;

    @ApiPropertyOptional({ description: 'Filter by kurikulum ID' })
    @IsOptional()
    @IsUUID()
    kurikulum_id?: string;
}
