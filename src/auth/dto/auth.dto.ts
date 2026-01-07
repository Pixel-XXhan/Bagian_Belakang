import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'guru@sekolah.id' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsString()
    @MinLength(6)
    password: string;
}

export class RegisterDto {
    @ApiProperty({ example: 'guru@sekolah.id' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({ example: 'Nama Guru' })
    @IsOptional()
    @IsString()
    nama_lengkap?: string;

    @ApiPropertyOptional({ example: 'SMA Negeri 1 Jakarta' })
    @IsOptional()
    @IsString()
    institusi?: string;
}

export class ResetPasswordDto {
    @ApiProperty({ example: 'guru@sekolah.id' })
    @IsEmail()
    email: string;
}

export class UpdatePasswordDto {
    @ApiProperty({ example: 'newpassword123', minLength: 6 })
    @IsString()
    @MinLength(6)
    password: string;
}
