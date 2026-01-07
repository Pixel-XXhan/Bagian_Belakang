import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Token tidak ditemukan');
        }

        const token = authHeader.replace('Bearer ', '');
        const user = await this.authService.getUserFromToken(token);

        if (!user) {
            throw new UnauthorizedException('Token tidak valid atau sudah expired');
        }

        // Attach user ke request untuk digunakan di controller
        request.user = user;
        return true;
    }
}
