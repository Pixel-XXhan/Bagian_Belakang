import { IsString, IsOptional, IsUUID, IsArray, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateModulAjarDto {
    @ApiProperty({ description: 'Judul modul ajar', example: 'Modul Pengukuran Sudut' })
    @IsString()
    judul: string;

    @ApiPropertyOptional({ description: 'ID RPP terkait' })
    @IsOptional()
    @IsUUID()
    rpp_id?: string;

    @ApiPropertyOptional({ description: 'Profil Pelajar Pancasila', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    profil_pelajar_pancasila?: string[];

    @ApiPropertyOptional({ description: 'Sarana dan prasarana', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sarana_prasarana?: string[];

    @ApiPropertyOptional({ description: 'Target peserta didik' })
    @IsOptional()
    @IsString()
    target_peserta_didik?: string;

    @ApiPropertyOptional({ description: 'Model pembelajaran' })
    @IsOptional()
    @IsString()
    model_pembelajaran?: string;

    @ApiPropertyOptional({ description: 'Konten modul ajar (JSON)' })
    @IsOptional()
    @IsObject()
    konten?: Record<string, any>;
}

export class UpdateModulAjarDto extends PartialType(CreateModulAjarDto) { }

export class GenerateModulAjarDto {
    @ApiProperty({ description: 'Mata pelajaran', example: 'Matematika' })
    @IsString()
    mapel: string;

    @ApiProperty({ description: 'Topik/materi', example: 'Pengukuran Sudut' })
    @IsString()
    topik: string;

    @ApiProperty({ description: 'Kelas', example: 'X SMA' })
    @IsString()
    kelas: string;

    @ApiPropertyOptional({ description: 'Fase pembelajaran', example: 'E' })
    @IsOptional()
    @IsString()
    fase?: string;

    @ApiPropertyOptional({ description: 'Alokasi waktu (menit)' })
    @IsOptional()
    alokasi_waktu?: number;

    @ApiPropertyOptional({ description: 'Model AI' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({ description: 'Simpan ke database', default: true })
    @IsOptional()
    save_to_db?: boolean;
}

export class ModulAjarQueryDto {
    @ApiPropertyOptional({ description: 'Filter by RPP ID' })
    @IsOptional()
    @IsUUID()
    rpp_id?: string;

    @ApiPropertyOptional({ description: 'Search by judul' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Limit results' })
    @IsOptional()
    @Type(() => Number)
    limit?: number;

    @ApiPropertyOptional({ description: 'Offset for pagination' })
    @IsOptional()
    @Type(() => Number)
    offset?: number;
}
