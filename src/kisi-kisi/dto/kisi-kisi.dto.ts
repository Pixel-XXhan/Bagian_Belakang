import { IsString, IsOptional, IsUUID, IsArray, IsObject, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class IndikatorSoalDto {
    @ApiProperty({ description: 'Nomor soal' })
    @IsInt()
    nomor_soal: number;

    @ApiProperty({ description: 'Indikator' })
    @IsString()
    indikator: string;

    @ApiPropertyOptional({ description: 'Level kognitif (C1-C6)' })
    @IsOptional()
    @IsString()
    level_kognitif?: string;

    @ApiPropertyOptional({ description: 'Bentuk soal' })
    @IsOptional()
    @IsString()
    bentuk_soal?: string;
}

export class CreateKisiKisiDto {
    @ApiProperty({ description: 'Judul kisi-kisi' })
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

    @ApiPropertyOptional({ description: 'Jenis ujian (PTS/PAS/UH)' })
    @IsOptional()
    @IsString()
    jenis_ujian?: string;

    @ApiPropertyOptional({ description: 'Tahun ajaran' })
    @IsOptional()
    @IsString()
    tahun_ajaran?: string;

    @ApiPropertyOptional({ description: 'Kompetensi dasar yang diuji', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    kompetensi_dasar?: string[];

    @ApiPropertyOptional({ description: 'Detail indikator soal', type: Object })
    @IsOptional()
    @IsObject()
    indikator_soal?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Konten lengkap (JSON)' })
    @IsOptional()
    @IsObject()
    konten?: Record<string, any>;
}

export class UpdateKisiKisiDto extends PartialType(CreateKisiKisiDto) { }

export class GenerateKisiKisiDto {
    @ApiProperty({ description: 'Mata pelajaran' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Topik/materi yang diujikan' })
    @IsString()
    topik: string;

    @ApiProperty({ description: 'Kelas' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ description: 'Jenis ujian', example: 'PTS' })
    @IsOptional()
    @IsString()
    jenis_ujian?: string;

    @ApiPropertyOptional({ description: 'Jumlah soal' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    jumlah_soal?: number;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({ description: 'Simpan ke database' })
    @IsOptional()
    save_to_db?: boolean;
}

export class KisiKisiQueryDto {
    @ApiPropertyOptional({ description: 'Filter by mapel ID' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ description: 'Filter by jenis ujian' })
    @IsOptional()
    @IsString()
    jenis_ujian?: string;

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
