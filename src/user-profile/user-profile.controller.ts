import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import {
    CreateUserProfileDto,
    UpdateUserProfileDto,
    UserPreferencesDto,
    UserProfileResponse,
} from './dto/user-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('User Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/users')
export class UserProfileController {
    constructor(private readonly userProfileService: UserProfileService) { }

    @Get('profile')
    @ApiOperation({
        summary: 'Get current user profile',
        description: 'Mendapatkan profil pengguna yang sedang login',
    })
    @ApiResponse({ status: 200, description: 'Profile berhasil didapatkan' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getProfile(@CurrentUser() user: CurrentUserData) {
        return this.userProfileService.getProfile(user.id);
    }

    @Post('profile')
    @ApiOperation({
        summary: 'Create user profile',
        description: 'Membuat profil pengguna baru',
    })
    @ApiResponse({ status: 201, description: 'Profile berhasil dibuat' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async createProfile(
        @CurrentUser() user: CurrentUserData,
        @Body() dto: CreateUserProfileDto,
    ) {
        return this.userProfileService.createProfile(user.id, dto);
    }

    @Put('profile')
    @ApiOperation({
        summary: 'Update user profile',
        description: 'Mengupdate profil pengguna',
    })
    @ApiResponse({ status: 200, description: 'Profile berhasil diupdate' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updateProfile(
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateUserProfileDto,
    ) {
        return this.userProfileService.updateProfile(user.id, dto);
    }

    @Delete('profile')
    @ApiOperation({
        summary: 'Delete user profile',
        description: 'Menghapus profil dan preferensi pengguna',
    })
    @ApiResponse({ status: 200, description: 'Profile berhasil dihapus' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async deleteProfile(@CurrentUser() user: CurrentUserData) {
        return this.userProfileService.deleteProfile(user.id);
    }

    @Get('preferences')
    @ApiOperation({
        summary: 'Get user preferences',
        description: 'Mendapatkan preferensi pengguna',
    })
    @ApiResponse({ status: 200, description: 'Preferences berhasil didapatkan' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getPreferences(@CurrentUser() user: CurrentUserData) {
        return this.userProfileService.getPreferences(user.id);
    }

    @Put('preferences')
    @ApiOperation({
        summary: 'Update user preferences',
        description: 'Mengupdate preferensi pengguna',
    })
    @ApiResponse({ status: 200, description: 'Preferences berhasil diupdate' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updatePreferences(
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UserPreferencesDto,
    ) {
        return this.userProfileService.updatePreferences(user.id, dto);
    }
}
