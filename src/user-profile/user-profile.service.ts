import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
    CreateUserProfileDto,
    UpdateUserProfileDto,
    UserPreferencesDto,
} from './dto/user-profile.dto';

@Injectable()
export class UserProfileService {
    private readonly logger = new Logger(UserProfileService.name);

    constructor(private supabaseService: SupabaseService) { }

    /**
     * Get user profile by user ID
     */
    async getProfile(userId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            this.logger.error('Error fetching profile:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Create user profile
     */
    async createProfile(userId: string, dto: CreateUserProfileDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('user_profiles')
            .insert({
                user_id: userId,
                ...dto,
            })
            .select()
            .single();

        if (error) {
            this.logger.error('Error creating profile:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, dto: UpdateUserProfileDto) {
        // Check if profile exists
        const existing = await this.getProfile(userId);

        if (!existing) {
            // Create new profile if doesn't exist
            return this.createProfile(userId, dto as CreateUserProfileDto);
        }

        const { data, error } = await this.supabaseService
            .getClient()
            .from('user_profiles')
            .update({
                ...dto,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            this.logger.error('Error updating profile:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Get user preferences
     */
    async getPreferences(userId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            this.logger.error('Error fetching preferences:', error.message);
            throw error;
        }

        // Return defaults if no preferences found
        return data || {
            theme: 'system',
            language: 'id',
            default_ai_model: 'gemini-1.5-flash',
            email_notifications: true,
        };
    }

    /**
     * Update user preferences
     */
    async updatePreferences(userId: string, dto: UserPreferencesDto) {
        // Try to update first
        const { data: existing } = await this.supabaseService
            .getClient()
            .from('user_preferences')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (existing) {
            const { data, error } = await this.supabaseService
                .getClient()
                .from('user_preferences')
                .update({
                    ...dto,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                this.logger.error('Error updating preferences:', error.message);
                throw error;
            }
            return data;
        }

        // Create new preferences
        const { data, error } = await this.supabaseService
            .getClient()
            .from('user_preferences')
            .insert({
                user_id: userId,
                ...dto,
            })
            .select()
            .single();

        if (error) {
            this.logger.error('Error creating preferences:', error.message);
            throw error;
        }

        return data;
    }

    /**
     * Delete user profile and preferences
     */
    async deleteProfile(userId: string) {
        // Delete preferences first
        await this.supabaseService
            .getClient()
            .from('user_preferences')
            .delete()
            .eq('user_id', userId);

        // Delete profile
        const { error } = await this.supabaseService
            .getClient()
            .from('user_profiles')
            .delete()
            .eq('user_id', userId);

        if (error) {
            this.logger.error('Error deleting profile:', error.message);
            throw error;
        }

        return { message: 'Profile berhasil dihapus' };
    }
}
