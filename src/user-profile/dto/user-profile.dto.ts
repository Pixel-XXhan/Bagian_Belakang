import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserProfileDto {
    @ApiProperty({ description: 'Nama lengkap pengguna' })
    @IsString()
    nama_lengkap: string;

    @ApiPropertyOptional({ description: 'Nomor Induk Pegawai' })
    @IsOptional()
    @IsString()
    nip?: string;

    @ApiPropertyOptional({ description: 'Nomor Unik Pendidik dan Tenaga Kependidikan' })
    @IsOptional()
    @IsString()
    nuptk?: string;

    @ApiPropertyOptional({ description: 'Nama institusi/sekolah' })
    @IsOptional()
    @IsString()
    institusi?: string;

    @ApiPropertyOptional({ description: 'ID jenjang pendidikan' })
    @IsOptional()
    @IsUUID()
    jenjang_id?: string;

    @ApiPropertyOptional({ description: 'ID mata pelajaran yang diampu', type: [String] })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    mapel_ids?: string[];
}

export class UpdateUserProfileDto {
    @ApiPropertyOptional({ description: 'Nama lengkap pengguna' })
    @IsOptional()
    @IsString()
    nama_lengkap?: string;

    @ApiPropertyOptional({ description: 'Nomor Induk Pegawai' })
    @IsOptional()
    @IsString()
    nip?: string;

    @ApiPropertyOptional({ description: 'Nomor Unik Pendidik dan Tenaga Kependidikan' })
    @IsOptional()
    @IsString()
    nuptk?: string;

    @ApiPropertyOptional({ description: 'Nama institusi/sekolah' })
    @IsOptional()
    @IsString()
    institusi?: string;

    @ApiPropertyOptional({ description: 'ID jenjang pendidikan' })
    @IsOptional()
    @IsUUID()
    jenjang_id?: string;

    @ApiPropertyOptional({ description: 'ID mata pelajaran yang diampu', type: [String] })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    mapel_ids?: string[];
}

export class UserPreferencesDto {
    @ApiPropertyOptional({ description: 'Tema aplikasi', enum: ['light', 'dark', 'system'] })
    @IsOptional()
    @IsString()
    theme?: 'light' | 'dark' | 'system';

    @ApiPropertyOptional({ description: 'Bahasa', enum: ['id', 'en'] })
    @IsOptional()
    @IsString()
    language?: 'id' | 'en';

    @ApiPropertyOptional({ description: 'Model AI default untuk generate' })
    @IsOptional()
    @IsString()
    default_ai_model?: string;

    @ApiPropertyOptional({ description: 'Notifikasi email aktif' })
    @IsOptional()
    email_notifications?: boolean;
}

export class UserProfileResponse {
    @ApiProperty()
    id: string;

    @ApiProperty()
    user_id: string;

    @ApiProperty()
    nama_lengkap: string;

    @ApiPropertyOptional()
    nip?: string;

    @ApiPropertyOptional()
    nuptk?: string;

    @ApiPropertyOptional()
    institusi?: string;

    @ApiPropertyOptional()
    jenjang_id?: string;

    @ApiPropertyOptional()
    mapel_ids?: string[];

    @ApiProperty()
    created_at: Date;

    @ApiProperty()
    updated_at: Date;
}
