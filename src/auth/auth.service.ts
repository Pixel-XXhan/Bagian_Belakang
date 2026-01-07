import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto, RegisterDto, ResetPasswordDto, UpdatePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(private supabaseService: SupabaseService) { }

    /**
     * Login dengan email dan password
     */
    async signInWithPassword(dto: LoginDto) {
        const { data, error } = await this.supabaseService.getClient().auth.signInWithPassword({
            email: dto.email,
            password: dto.password,
        });

        if (error) {
            this.logger.error('Login gagal:', error.message);
            throw new UnauthorizedException(error.message || 'Email atau password salah');
        }

        return {
            user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.nama_lengkap || data.user.user_metadata?.full_name,
                institusi: data.user.user_metadata?.institusi,
            },
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
            },
        };
    }

    /**
     * Register user baru dengan email dan password
     */
    async signUp(dto: RegisterDto) {
        const { data, error } = await this.supabaseService.getClient().auth.signUp({
            email: dto.email,
            password: dto.password,
            options: {
                data: {
                    nama_lengkap: dto.nama_lengkap,
                    institusi: dto.institusi,
                },
            },
        });

        if (error) {
            this.logger.error('Register gagal:', error.message);
            throw new BadRequestException(error.message || 'Gagal mendaftarkan user');
        }

        return {
            message: 'Registrasi berhasil. Silakan cek email untuk verifikasi.',
            user: {
                id: data.user?.id,
                email: data.user?.email,
            },
        };
    }

    /**
     * Kirim email reset password
     */
    async resetPassword(dto: ResetPasswordDto) {
        const { error } = await this.supabaseService.getClient().auth.resetPasswordForEmail(dto.email, {
            redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`,
        });

        if (error) {
            this.logger.error('Reset password gagal:', error.message);
            throw new BadRequestException(error.message || 'Gagal mengirim email reset password');
        }

        return {
            message: 'Email reset password telah dikirim. Silakan cek inbox Anda.',
        };
    }

    /**
     * Update password (setelah reset)
     */
    async updatePassword(dto: UpdatePasswordDto, accessToken: string) {
        // Set session dari token
        const { error: sessionError } = await this.supabaseService.getClient().auth.setSession({
            access_token: accessToken,
            refresh_token: '',
        });

        if (sessionError) {
            throw new UnauthorizedException('Token tidak valid');
        }

        const { error } = await this.supabaseService.getClient().auth.updateUser({
            password: dto.password,
        });

        if (error) {
            this.logger.error('Update password gagal:', error.message);
            throw new BadRequestException(error.message || 'Gagal mengubah password');
        }

        return {
            message: 'Password berhasil diubah.',
        };
    }

    /**
     * Mendapatkan URL untuk login dengan Google OAuth
     */
    async getGoogleAuthUrl(redirectTo: string): Promise<string> {
        const { data, error } = await this.supabaseService.getClient().auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
            },
        });

        if (error) {
            this.logger.error('Gagal mendapatkan Google Auth URL:', error.message);
            throw error;
        }

        return data.url;
    }

    /**
     * Mendapatkan URL untuk login dengan Facebook OAuth
     */
    async getFacebookAuthUrl(redirectTo: string): Promise<string> {
        const { data, error } = await this.supabaseService.getClient().auth.signInWithOAuth({
            provider: 'facebook',
            options: {
                redirectTo,
            },
        });

        if (error) {
            this.logger.error('Gagal mendapatkan Facebook Auth URL:', error.message);
            throw error;
        }

        return data.url;
    }

    /**
     * Mendapatkan user dari access token
     */
    async getUserFromToken(accessToken: string) {
        const { data, error } = await this.supabaseService.getClient().auth.getUser(accessToken);

        if (error) {
            this.logger.error('Gagal mendapatkan user dari token:', error.message);
            return null;
        }

        return data.user;
    }

    /**
     * Logout user
     */
    async logout() {
        const { error } = await this.supabaseService.getClient().auth.signOut();

        if (error) {
            this.logger.error('Gagal logout:', error.message);
            throw error;
        }

        return { message: 'Logout berhasil' };
    }

    /**
     * Refresh session
     */
    async refreshSession(refreshToken: string) {
        const { data, error } = await this.supabaseService.getClient().auth.refreshSession({
            refresh_token: refreshToken,
        });

        if (error) {
            this.logger.error('Gagal refresh session:', error.message);
            throw error;
        }

        return data;
    }
}

