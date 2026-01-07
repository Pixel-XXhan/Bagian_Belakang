import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuggestionsService } from './suggestions.service';
import { GetSuggestionsDto, RelatedDocumentsDto, TopicSuggestionsDto } from './dto/suggestions.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('AI Suggestions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/suggestions')
export class SuggestionsController {
    constructor(private readonly suggestionsService: SuggestionsService) { }

    @Post('topics')
    @ApiOperation({ summary: 'Get AI topic suggestions for a subject' })
    async getTopicSuggestions(@Body() dto: TopicSuggestionsDto) {
        return this.suggestionsService.getTopicSuggestions(dto);
    }

    @Post('related')
    @ApiOperation({ summary: 'Get related documents based on a document' })
    async getRelatedDocuments(
        @CurrentUser() user: CurrentUserData,
        @Body() dto: RelatedDocumentsDto,
    ) {
        return this.suggestionsService.getRelatedDocuments(user.id, dto);
    }

    @Post('smart')
    @ApiOperation({ summary: 'Get smart suggestions based on context' })
    async getSmartSuggestions(
        @CurrentUser() user: CurrentUserData,
        @Body() dto: GetSuggestionsDto,
    ) {
        return this.suggestionsService.getSmartSuggestions(user.id, dto);
    }

    @Get('next-steps/:documentType/:documentId')
    @ApiOperation({ summary: 'Get recommended next steps after creating a document' })
    async getNextSteps(
        @CurrentUser() user: CurrentUserData,
        @Param('documentType') documentType: string,
        @Param('documentId') documentId: string,
    ) {
        return this.suggestionsService.getNextSteps(user.id, documentType, documentId);
    }
}
