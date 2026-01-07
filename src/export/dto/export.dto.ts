import { IsString, IsOptional, IsEnum, IsObject, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ExportFormat {
    PDF = 'pdf',
    DOCX = 'docx',
}

export enum DocumentType {
    RPP = 'rpp',
    SILABUS = 'silabus',
    MODUL_AJAR = 'modul_ajar',
    LKPD = 'lkpd',
    KISI_KISI = 'kisi_kisi',
}

export class ExportDocumentDto {
    @ApiProperty({ description: 'ID dokumen yang akan di-export' })
    @IsUUID()
    document_id: string;

    @ApiProperty({ enum: DocumentType, description: 'Tipe dokumen' })
    @IsEnum(DocumentType)
    document_type: DocumentType;

    @ApiProperty({ enum: ExportFormat, description: 'Format export', default: ExportFormat.PDF })
    @IsEnum(ExportFormat)
    format: ExportFormat;
}

export class GenerateAndExportDto {
    @ApiProperty({ description: 'Mata pelajaran', example: 'Matematika' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Topik/materi', example: 'Pengukuran Sudut' })
    @IsString()
    topik: string;

    @ApiProperty({ description: 'Kelas', example: 'X SMA' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ description: 'Kurikulum' })
    @IsOptional()
    @IsString()
    kurikulum?: string;

    @ApiPropertyOptional({ description: 'Alokasi waktu (menit)' })
    @IsOptional()
    alokasi_waktu?: number;

    @ApiProperty({ enum: DocumentType, description: 'Tipe dokumen' })
    @IsEnum(DocumentType)
    document_type: DocumentType;

    @ApiProperty({ enum: ExportFormat, description: 'Format export', default: ExportFormat.PDF })
    @IsEnum(ExportFormat)
    format: ExportFormat;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;
}

export class ExportResponse {
    @ApiProperty({ description: 'URL download file' })
    download_url: string;

    @ApiProperty({ description: 'Nama file' })
    filename: string;

    @ApiProperty({ description: 'Format file' })
    format: string;

    @ApiProperty({ description: 'Ukuran file dalam bytes' })
    size: number;

    @ApiProperty({ description: 'Waktu kadaluarsa URL (jika signed URL)' })
    expires_at?: string;
}
