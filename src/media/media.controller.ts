import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import {
    CreateMediaDto,
    UpdateMediaDto,
    GenerateMediaRecommendationDto,
    MediaQueryDto,
} from './dto/media.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('Media Pembelajaran')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Get()
    @ApiOperation({ summary: 'List media' })
    @ApiResponse({ status: 200, description: 'List of media' })
    async findAll(@CurrentUser() user: CurrentUserData, @Query() query: MediaQueryDto) {
        return this.mediaService.findAll(user.id, query);
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Get media statistics' })
    @ApiResponse({ status: 200, description: 'Statistics by jenis' })
    async getStatistics(@CurrentUser() user: CurrentUserData) {
        return this.mediaService.getStatistics(user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get media by ID' })
    @ApiResponse({ status: 200, description: 'Media detail' })
    async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.mediaService.findOne(id, user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Create media entry' })
    @ApiResponse({ status: 201, description: 'Media created' })
    async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateMediaDto) {
        return this.mediaService.create(user.id, dto);
    }

    @Post('recommend')
    @ApiOperation({ summary: 'Get AI media recommendations' })
    @ApiResponse({ status: 200, description: 'Media recommendations' })
    async recommend(@CurrentUser() user: CurrentUserData, @Body() dto: GenerateMediaRecommendationDto) {
        return this.mediaService.generateRecommendation(user.id, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update media' })
    @ApiResponse({ status: 200, description: 'Media updated' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateMediaDto,
    ) {
        return this.mediaService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete media' })
    @ApiResponse({ status: 200, description: 'Media deleted' })
    async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.mediaService.remove(id, user.id);
    }
}
