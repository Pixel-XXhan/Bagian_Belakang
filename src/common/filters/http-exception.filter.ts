import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
    success: false;
    statusCode: number;
    message: string;
    error: string;
    timestamp: string;
    path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Terjadi kesalahan internal server';
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const res = exceptionResponse as any;
                message = res.message || exception.message;
                error = res.error || 'Error';
            }

            // Handle ThrottlerException (429)
            if (status === HttpStatus.TOO_MANY_REQUESTS) {
                message = 'Terlalu banyak permintaan. Mohon tunggu beberapa saat sebelum mencoba lagi.';
                error = 'Too Many Requests';
            }
        } else if (exception instanceof Error) {
            message = exception.message;
            this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
        }

        // Translate common Supabase/Auth errors to Friendly Indonesian
        if (typeof message === 'string') {
            const lowMsg = message.toLowerCase();
            if (lowMsg.includes('invalid login credentials')) {
                message = 'Email atau password salah. Silakan coba lagi.';
                status = HttpStatus.UNAUTHORIZED;
            } else if (lowMsg.includes('email not confirmed')) {
                message = 'Email belum diverifikasi. Silakan cek inbox email Anda.';
                status = HttpStatus.UNAUTHORIZED;
            } else if (lowMsg.includes('user already registered')) {
                message = 'Email sudah terdaftar. Silakan login.';
                status = HttpStatus.BAD_REQUEST;
            } else if (lowMsg.includes('password should be at least')) {
                message = 'Password minimal harus 6 karakter.';
                status = HttpStatus.BAD_REQUEST;
            } else if (lowMsg.includes('rate limit exceeded')) {
                message = 'Terlalu banyak percobaan. Mohon tunggu beberapa saat.';
            }
        }

        const errorResponse: ErrorResponse = {
            success: false,
            statusCode: status,
            message: Array.isArray(message) ? message.join(', ') : message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        response.status(status).json(errorResponse);
    }
}
