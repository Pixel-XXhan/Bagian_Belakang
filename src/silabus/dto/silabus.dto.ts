import { IsString, IsOptional, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSilabusDto {
    @ApiPropertyOptional({ description: 'ID Mata Pelajaran' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ description: 'Kelas', example: 'X' })
    @IsOptional()
    @IsString()
    kelas?: string;

    @ApiPropertyOptional({ description: 'Semester', example: 'Ganjil' })
    @IsOptional()
    @IsString()
    semester?: string;

    @ApiPropertyOptional({ description: 'Tahun Ajaran', example: '2024/2025' })
    @IsOptional()
    @IsString()
    tahun_ajaran?: string;

    @ApiPropertyOptional({ description: 'Konten silabus (JSON)' })
    @IsOptional()
    @IsObject()
    konten?: Record<string, any>;
}

export class UpdateSilabusDto extends CreateSilabusDto { }

export class GenerateSilabusDto {
    @ApiProperty({ description: 'Mata pelajaran', example: 'Matematika' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Kelas', example: 'X SMA' })
    @IsString()
    kelas: string;

    @ApiProperty({ description: 'Semester', example: 'Ganjil' })
    @IsString()
    semester: string;

    @ApiPropertyOptional({ description: 'Tahun Ajaran', example: '2024/2025' })
    @IsOptional()
    @IsString()
    tahun_ajaran?: string;

    @ApiPropertyOptional({ description: 'Kurikulum', example: 'Kurikulum Merdeka' })
    @IsOptional()
    @IsString()
    kurikulum?: string;

    @ApiPropertyOptional({ description: 'Model AI', example: 'gemini-2.5-flash' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({ description: 'Simpan ke database', default: true })
    @IsOptional()
    save_to_db?: boolean;
}

export class SilabusQueryDto {
    @ApiPropertyOptional({ description: 'Filter by mapel ID' })
    @IsOptional()
    @IsUUID()
    mapel_id?: string;

    @ApiPropertyOptional({ description: 'Filter by kelas' })
    @IsOptional()
    @IsString()
    kelas?: string;

    @ApiPropertyOptional({ description: 'Filter by semester' })
    @IsOptional()
    @IsString()
    semester?: string;

    @ApiPropertyOptional({ description: 'Filter by tahun ajaran' })
    @IsOptional()
    @IsString()
    tahun_ajaran?: string;
}
