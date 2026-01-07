import { IsString, IsOptional, IsUUID, IsArray, IsObject, IsEnum, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TipeSoal {
    PILIHAN_GANDA = 'pilihan_ganda',
    ESSAY = 'essay',
    ISIAN_SINGKAT = 'isian_singkat',
    BENAR_SALAH = 'benar_salah',
    MENJODOHKAN = 'menjodohkan',
}

export enum TingkatKesulitan {
    MUDAH = 'mudah',
    SEDANG = 'sedang',
    SULIT = 'sulit',
}

export class PilihanDto {
    @ApiProperty({ description: 'Label pilihan', example: 'A' })
    @IsString()
    label: string;

    @ApiProperty({ description: 'Teks pilihan' })
    @IsString()
    text: string;
}

export class CreateSoalDto {
    @ApiPropertyOptional({ description: 'ID Mata Pelajaran' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiProperty({ enum: TipeSoal, description: 'Tipe soal' })
    @IsEnum(TipeSoal)
    tipe: TipeSoal;

    @ApiProperty({ enum: TingkatKesulitan, description: 'Tingkat kesulitan' })
    @IsEnum(TingkatKesulitan)
    tingkat_kesulitan: TingkatKesulitan;

    @ApiProperty({ description: 'Pertanyaan/soal' })
    @IsString()
    pertanyaan: string;

    @ApiPropertyOptional({ description: 'Pilihan jawaban (untuk pilihan ganda)', type: [PilihanDto] })
    @IsOptional()
    @IsArray()
    pilihan?: PilihanDto[];

    @ApiProperty({ description: 'Jawaban benar' })
    @IsString()
    jawaban_benar: string;

    @ApiPropertyOptional({ description: 'Pembahasan' })
    @IsOptional()
    @IsString()
    pembahasan?: string;

    @ApiPropertyOptional({ description: 'ID Kompetensi Dasar' })
    @IsOptional()
    @IsUUID()
    kd_id?: string;
}

export class UpdateSoalDto extends PartialType(CreateSoalDto) { }

export class GenerateSoalDto {
    @ApiProperty({ description: 'Mata pelajaran', example: 'Matematika' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Topik/materi', example: 'Pengukuran Sudut' })
    @IsString()
    topik: string;

    @ApiProperty({ description: 'Kelas', example: 'X SMA' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ enum: TipeSoal, description: 'Tipe soal', default: TipeSoal.PILIHAN_GANDA })
    @IsOptional()
    @IsEnum(TipeSoal)
    tipe?: TipeSoal;

    @ApiPropertyOptional({ enum: TingkatKesulitan, description: 'Tingkat kesulitan', default: TingkatKesulitan.SEDANG })
    @IsOptional()
    @IsEnum(TingkatKesulitan)
    tingkat_kesulitan?: TingkatKesulitan;

    @ApiPropertyOptional({ description: 'Jumlah soal yang digenerate', default: 5 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    jumlah?: number;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({ description: 'Simpan ke database', default: true })
    @IsOptional()
    save_to_db?: boolean;
}

export class SoalQueryDto {
    @ApiPropertyOptional({ description: 'Filter by mapel ID' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ enum: TipeSoal, description: 'Filter by tipe' })
    @IsOptional()
    @IsEnum(TipeSoal)
    tipe?: TipeSoal;

    @ApiPropertyOptional({ enum: TingkatKesulitan, description: 'Filter by tingkat kesulitan' })
    @IsOptional()
    @IsEnum(TingkatKesulitan)
    tingkat_kesulitan?: TingkatKesulitan;

    @ApiPropertyOptional({ description: 'Search in pertanyaan' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Limit' })
    @IsOptional()
    @Type(() => Number)
    limit?: number;

    @ApiPropertyOptional({ description: 'Offset' })
    @IsOptional()
    @Type(() => Number)
    offset?: number;
}
