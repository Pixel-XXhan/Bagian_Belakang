import { IsString, IsOptional, IsUUID, IsArray, IsObject, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTujuanPembelajaranDto {
    @ApiProperty({ description: 'Tujuan pembelajaran (deskripsi)' })
    @IsString()
    deskripsi: string;

    @ApiPropertyOptional({ description: 'ID ATP terkait' })
    @IsOptional()
    @IsUUID()
    atp_id?: string;

    @ApiPropertyOptional({ description: 'ID Capaian Pembelajaran' })
    @IsOptional()
    @IsUUID()
    cp_id?: string;

    @ApiPropertyOptional({ description: 'ID Mata Pelajaran' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ description: 'Kelas' })
    @IsOptional()
    @IsString()
    kelas?: string;

    @ApiPropertyOptional({ description: 'Alokasi waktu (menit)' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    alokasi_waktu?: number;

    @ApiPropertyOptional({ description: 'Urutan dalam ATP' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    urutan?: number;

    @ApiPropertyOptional({ description: 'Indikator ketercapaian', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    indikator?: string[];

    @ApiPropertyOptional({ description: 'Kata kerja operasional' })
    @IsOptional()
    @IsString()
    kata_kerja_operasional?: string;

    @ApiPropertyOptional({ description: 'Level kognitif (C1-C6)' })
    @IsOptional()
    @IsString()
    level_kognitif?: string;
}

export class UpdateTujuanPembelajaranDto extends PartialType(CreateTujuanPembelajaranDto) { }

export class GenerateTujuanPembelajaranDto {
    @ApiProperty({ description: 'Mata pelajaran' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Topik/materi' })
    @IsString()
    topik: string;

    @ApiProperty({ description: 'Kelas' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ description: 'Capaian pembelajaran (jika ada)' })
    @IsOptional()
    @IsString()
    capaian_pembelajaran?: string;

    @ApiPropertyOptional({ description: 'Jumlah TP yang digenerate', default: 3 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    jumlah?: number;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({ description: 'Simpan ke database' })
    @IsOptional()
    save_to_db?: boolean;
}

export class TujuanPembelajaranQueryDto {
    @ApiPropertyOptional({ description: 'Filter by mapel ID' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ description: 'Filter by ATP ID' })
    @IsOptional()
    @IsUUID()
    atp_id?: string;

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
