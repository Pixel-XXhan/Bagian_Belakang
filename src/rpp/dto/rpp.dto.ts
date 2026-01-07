import { IsString, IsOptional, IsUUID, IsInt, IsArray, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum RppStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
}

export class KegiatanPembelajaranDto {
    @ApiPropertyOptional({ description: 'Kegiatan pendahuluan' })
    @IsOptional()
    @IsString()
    pendahuluan?: string;

    @ApiPropertyOptional({ description: 'Kegiatan inti' })
    @IsOptional()
    @IsString()
    inti?: string;

    @ApiPropertyOptional({ description: 'Kegiatan penutup' })
    @IsOptional()
    @IsString()
    penutup?: string;
}

export class CreateRppDto {
    @ApiProperty({ description: 'Judul RPP', example: 'Pengukuran Sudut' })
    @IsString()
    judul: string;

    @ApiPropertyOptional({ description: 'ID Silabus' })
    @IsOptional()
    @IsUUID()
    silabus_id?: string;

    @ApiPropertyOptional({ description: 'ID Mata Pelajaran' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ description: 'Kelas', example: 'X' })
    @IsOptional()
    @IsString()
    kelas?: string;

    @ApiPropertyOptional({ description: 'Materi pokok' })
    @IsOptional()
    @IsString()
    materi_pokok?: string;

    @ApiPropertyOptional({ description: 'Alokasi waktu (menit)', example: 90 })
    @IsOptional()
    @IsInt()
    alokasi_waktu?: number;

    @ApiPropertyOptional({ description: 'Tujuan pembelajaran', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tujuan_pembelajaran?: string[];

    @ApiPropertyOptional({ description: 'Kegiatan pembelajaran', type: KegiatanPembelajaranDto })
    @IsOptional()
    @IsObject()
    @Type(() => KegiatanPembelajaranDto)
    kegiatan?: KegiatanPembelajaranDto;

    @ApiPropertyOptional({ description: 'Asesmen', type: Object })
    @IsOptional()
    @IsObject()
    asesmen?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Konten lengkap RPP (JSON)', type: Object })
    @IsOptional()
    @IsObject()
    konten_lengkap?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Status RPP', enum: RppStatus })
    @IsOptional()
    @IsEnum(RppStatus)
    status?: RppStatus;
}

export class UpdateRppDto {
    @ApiPropertyOptional({ description: 'Judul RPP' })
    @IsOptional()
    @IsString()
    judul?: string;

    @ApiPropertyOptional({ description: 'ID Silabus' })
    @IsOptional()
    @IsUUID()
    silabus_id?: string;

    @ApiPropertyOptional({ description: 'ID Mata Pelajaran' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ description: 'Kelas' })
    @IsOptional()
    @IsString()
    kelas?: string;

    @ApiPropertyOptional({ description: 'Materi pokok' })
    @IsOptional()
    @IsString()
    materi_pokok?: string;

    @ApiPropertyOptional({ description: 'Alokasi waktu (menit)' })
    @IsOptional()
    @IsInt()
    alokasi_waktu?: number;

    @ApiPropertyOptional({ description: 'Tujuan pembelajaran', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tujuan_pembelajaran?: string[];

    @ApiPropertyOptional({ description: 'Kegiatan pembelajaran', type: KegiatanPembelajaranDto })
    @IsOptional()
    @IsObject()
    @Type(() => KegiatanPembelajaranDto)
    kegiatan?: KegiatanPembelajaranDto;

    @ApiPropertyOptional({ description: 'Asesmen', type: Object })
    @IsOptional()
    @IsObject()
    asesmen?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Konten lengkap RPP (JSON)', type: Object })
    @IsOptional()
    @IsObject()
    konten_lengkap?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Status RPP', enum: RppStatus })
    @IsOptional()
    @IsEnum(RppStatus)
    status?: RppStatus;
}

export class GenerateRppDto {
    @ApiProperty({ description: 'Mata pelajaran', example: 'Matematika' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Topik/materi', example: 'Pengukuran Sudut' })
    @IsString()
    topik: string;

    @ApiProperty({ description: 'Kelas', example: 'X SMA' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ description: 'Kurikulum', example: 'Kurikulum Merdeka' })
    @IsOptional()
    @IsString()
    kurikulum?: string;

    @ApiPropertyOptional({ description: 'Alokasi waktu (menit)', example: 90 })
    @IsOptional()
    @IsInt()
    alokasi_waktu?: number;

    @ApiPropertyOptional({ description: 'Model AI yang digunakan', example: 'gemini-2.5-flash' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({ description: 'Custom system instruction untuk AI' })
    @IsOptional()
    @IsString()
    system_instruction?: string;

    @ApiPropertyOptional({ description: 'Simpan hasil ke database', default: true })
    @IsOptional()
    save_to_db?: boolean;
}

export class RppQueryDto {
    @ApiPropertyOptional({ description: 'Filter by mapel ID' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ description: 'Filter by kelas' })
    @IsOptional()
    @IsString()
    kelas?: string;

    @ApiPropertyOptional({ description: 'Filter by status', enum: RppStatus })
    @IsOptional()
    @IsEnum(RppStatus)
    status?: RppStatus;

    @ApiPropertyOptional({ description: 'Search by judul' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Limit results', example: 10 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    limit?: number;

    @ApiPropertyOptional({ description: 'Offset for pagination', example: 0 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    offset?: number;
}
