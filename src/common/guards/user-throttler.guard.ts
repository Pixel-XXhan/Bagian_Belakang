import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
    protected async getTracker(req: Record<string, any>): Promise<string> {
        if (req.user && req.user.id) {
            // Authenticated user: Track by User ID
            // Prefix with 'user-' to distinguish from IPs
            return `user-${req.user.id}`;
        }
        // Guest: Track by IP
        return req.ips.length ? req.ips[0] : req.ip;
    }
}
