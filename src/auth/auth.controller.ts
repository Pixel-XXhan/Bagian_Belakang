import { Controller, Get, Post, Body, Query, Res, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto, ResetPasswordDto, UpdatePasswordDto } from './dto/auth.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) { }

    @Post('login')
    @Throttle({ default: { limit: 10, ttl: 60000 } }) // Strict limit: 10/min
    @ApiOperation({
        summary: 'Login dengan email dan password',
        description: 'Autentikasi user menggunakan email dan password'
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 200,
        description: 'Login berhasil',
        schema: {
            example: {
                user: { id: 'uuid', email: 'guru@sekolah.id', name: 'Nama Guru', institusi: 'SMA Negeri 1' },
                session: { access_token: 'eyJ...', refresh_token: 'xxx', expires_at: 1234567890 }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Email atau password salah' })
    async login(@Body() dto: LoginDto) {
        return this.authService.signInWithPassword(dto);
    }

    @Post('register')
    @Throttle({ default: { limit: 10, ttl: 60000 } }) // Strict limit: 10/min
    @ApiOperation({
        summary: 'Register user baru',
        description: 'Mendaftarkan user baru dengan email dan password. Email verifikasi akan dikirim.'
    })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 201, description: 'Registrasi berhasil, cek email untuk verifikasi' })
    @ApiResponse({ status: 400, description: 'Email sudah terdaftar atau data tidak valid' })
    async register(@Body() dto: RegisterDto) {
        return this.authService.signUp(dto);
    }

    @Post('forgot-password')
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // Very Strict limit: 5/min
    @ApiOperation({
        summary: 'Kirim email reset password',
        description: 'Mengirim email berisi link untuk reset password'
    })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({ status: 200, description: 'Email reset password telah dikirim' })
    async forgotPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    @Post('update-password')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update password',
        description: 'Mengubah password setelah reset (memerlukan token dari email reset)'
    })
    @ApiHeader({ name: 'Authorization', description: 'Bearer token dari email reset', required: true })
    @ApiBody({ type: UpdatePasswordDto })
    @ApiResponse({ status: 200, description: 'Password berhasil diubah' })
    async updatePassword(
        @Body() dto: UpdatePasswordDto,
        @Headers('authorization') authHeader: string
    ) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Token tidak ditemukan');
        }
        const token = authHeader.replace('Bearer ', '');
        return this.authService.updatePassword(dto, token);
    }

    @Get('google')
    @ApiOperation({
        summary: 'Login dengan Google OAuth',
        description: 'Redirect ke halaman login Google untuk autentikasi'
    })
    @ApiQuery({ name: 'redirect', required: false, description: 'Custom redirect URL setelah login' })
    @ApiResponse({ status: 302, description: 'Redirect ke Google OAuth' })
    async googleAuth(@Res() res: any, @Query('redirect') redirect?: string) {
        const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const redirectTo = redirect || `${baseUrl}/auth/callback`;

        const authUrl = await this.authService.getGoogleAuthUrl(redirectTo);
        return res.redirect(authUrl);
    }

    @Get('facebook')
    @ApiOperation({
        summary: 'Login dengan Facebook OAuth',
        description: 'Redirect ke halaman login Facebook untuk autentikasi'
    })
    @ApiQuery({ name: 'redirect', required: false, description: 'Custom redirect URL setelah login' })
    @ApiResponse({ status: 302, description: 'Redirect ke Facebook OAuth' })
    async facebookAuth(@Res() res: any, @Query('redirect') redirect?: string) {
        const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const redirectTo = redirect || `${baseUrl}/auth/callback`;

        const authUrl = await this.authService.getFacebookAuthUrl(redirectTo);
        return res.redirect(authUrl);
    }

    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get current user',
        description: 'Mendapatkan informasi user yang sedang login dari access token'
    })
    @ApiHeader({ name: 'Authorization', description: 'Bearer token', required: true })
    @ApiResponse({ status: 200, description: 'User data berhasil didapatkan' })
    @ApiResponse({ status: 401, description: 'Token tidak valid atau expired' })
    async getCurrentUser(@Headers('authorization') authHeader: string) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Token tidak ditemukan');
        }

        const token = authHeader.replace('Bearer ', '');
        const user = await this.authService.getUserFromToken(token);

        if (!user) {
            throw new UnauthorizedException('Token tidak valid');
        }

        return {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.nama_lengkap,
            avatar: user.user_metadata?.avatar_url,
            institusi: user.user_metadata?.institusi,
            provider: user.app_metadata?.provider,
        };
    }

    @Post('logout')
    @ApiOperation({
        summary: 'Logout user',
        description: 'Mengakhiri session user saat ini'
    })
    @ApiResponse({ status: 200, description: 'Logout berhasil' })
    async logout() {
        return this.authService.logout();
    }

    @Post('refresh')
    @ApiOperation({
        summary: 'Refresh access token',
        description: 'Mendapatkan access token baru menggunakan refresh token'
    })
    @ApiHeader({ name: 'x-refresh-token', description: 'Refresh token', required: true })
    @ApiResponse({ status: 200, description: 'Token berhasil direfresh' })
    @ApiResponse({ status: 401, description: 'Refresh token tidak valid' })
    async refresh(@Headers('x-refresh-token') refreshToken: string) {
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token tidak ditemukan');
        }

        return this.authService.refreshSession(refreshToken);
    }
}

