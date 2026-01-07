import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { SupabaseService } from '../supabase/supabase.service';
import { ConfigService } from '@nestjs/config';

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    uptime: number;
    services: {
        database: { status: string; latency?: number };
        ai: { status: string };
        storage: { status: string };
    };
}

@ApiTags('Health')
@Controller('api/health')
export class HealthController {
    private startTime = Date.now();

    constructor(
        private supabaseService: SupabaseService,
        private configService: ConfigService,
    ) { }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({ status: 200, description: 'Service is healthy' })
    async check(): Promise<HealthStatus> {
        const dbHealth = await this.checkDatabase();
        const aiHealth = this.checkAI();
        const storageHealth = await this.checkStorage();

        const allHealthy = dbHealth.status === 'ok' && aiHealth.status === 'ok' && storageHealth.status === 'ok';
        const anyUnhealthy = dbHealth.status === 'error' || aiHealth.status === 'error' || storageHealth.status === 'error';

        return {
            status: allHealthy ? 'healthy' : anyUnhealthy ? 'unhealthy' : 'degraded',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            services: {
                database: dbHealth,
                ai: aiHealth,
                storage: storageHealth,
            },
        };
    }

    @Get('ping')
    @Public()
    @ApiOperation({ summary: 'Simple ping endpoint' })
    ping() {
        return { status: 'pong', timestamp: new Date().toISOString() };
    }

    private async checkDatabase(): Promise<{ status: string; latency?: number }> {
        try {
            const start = Date.now();
            const { error } = await this.supabaseService.getClient().from('kurikulum').select('id').limit(1);
            const latency = Date.now() - start;
            return error ? { status: 'error' } : { status: 'ok', latency };
        } catch {
            return { status: 'error' };
        }
    }

    private checkAI(): { status: string } {
        const geminiKey = this.configService.get('GEMINI_API_KEY');
        return { status: geminiKey ? 'ok' : 'not_configured' };
    }

    private async checkStorage(): Promise<{ status: string }> {
        try {
            const { error } = await this.supabaseService.getClient().storage.listBuckets();
            return error ? { status: 'error' } : { status: 'ok' };
        } catch {
            return { status: 'error' };
        }
    }
}
