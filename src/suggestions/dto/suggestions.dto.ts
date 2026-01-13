import { IsString, IsOptional, IsUUID, IsArray, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetSuggestionsDto {
    @ApiProperty({ description: 'Mata pelajaran' })
    @IsString()
    mapel: string;

    @ApiPropertyOptional({ description: 'Kelas' })
    @IsOptional()
    @IsString()
    kelas?: string;

    @ApiPropertyOptional({ description: 'Topik saat ini' })
    @IsOptional()
    @IsString()
    topik?: string;

    @ApiPropertyOptional({ description: 'Jenis dokumen (rpp, silabus, lkpd, dll)' })
    @IsOptional()
    @IsString()
    jenis_dokumen?: string;

    @ApiPropertyOptional({ description: 'Jumlah saran' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    limit?: number;
}

export class RelatedDocumentsDto {
    @ApiProperty({ description: 'ID dokumen referensi' })
    @IsUUID()
    document_id: string;

    @ApiProperty({ description: 'Tipe dokumen (rpp, silabus, lkpd, bank_soal)' })
    @IsString()
    document_type: string;

    @ApiPropertyOptional({ description: 'Jumlah hasil' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    limit?: number;
}

export class TopicSuggestionsDto {
    @ApiProperty({ description: 'Mata pelajaran' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Kelas' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ description: 'Semester' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    semester?: number;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;
}

export class TujuanPembelajaranDto {
    @ApiProperty({ description: 'Mata pelajaran', example: 'Matematika' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Topik pembelajaran', example: 'Persamaan Kuadrat' })
    @IsString()
    topik: string;

    @ApiProperty({ description: 'Kelas', example: '10' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ description: 'Kurikulum', example: 'merdeka' })
    @IsOptional()
    @IsString()
    kurikulum?: string;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;
}

export class KegiatanPembelajaranDto {
    @ApiProperty({ description: 'Mata pelajaran', example: 'Matematika' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Topik pembelajaran', example: 'Persamaan Kuadrat' })
    @IsString()
    topik: string;

    @ApiProperty({ description: 'Kelas', example: '10' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ description: 'Tujuan pembelajaran' })
    @IsOptional()
    @IsString()
    tujuan?: string;

    @ApiPropertyOptional({ description: 'Durasi dalam menit', example: 80 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    durasi?: number;

    @ApiPropertyOptional({ description: 'Kurikulum', example: 'merdeka' })
    @IsOptional()
    @IsString()
    kurikulum?: string;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;
}
