import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    provider?: string;
}

/**
 * Get current authenticated user from request
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: CurrentUserData) { ... }
 * 
 * // Get specific property
 * @Get('my-id')
 * getMyId(@CurrentUser('id') userId: string) { ... }
 */
export const CurrentUser = createParamDecorator(
    (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            return null;
        }

        return data ? user[data] : user;
    },
);
