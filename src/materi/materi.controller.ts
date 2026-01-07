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
    Res,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { MateriService } from './materi.service';
import {
    CreateMateriDto,
    UpdateMateriDto,
    GenerateMateriDto,
    MateriQueryDto,
} from './dto/materi.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('Materi Pembelajaran')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/materi')
export class MateriController {
    constructor(private readonly materiService: MateriService) { }

    @Get()
    @ApiOperation({ summary: 'List materi' })
    @ApiResponse({ status: 200, description: 'List of materi' })
    async findAll(@CurrentUser() user: CurrentUserData, @Query() query: MateriQueryDto) {
        return this.materiService.findAll(user.id, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get materi by ID' })
    @ApiResponse({ status: 200, description: 'Materi detail' })
    async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.materiService.findOne(id, user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Create materi manually' })
    @ApiResponse({ status: 201, description: 'Materi created' })
    async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateMateriDto) {
        return this.materiService.create(user.id, dto);
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate materi with AI' })
    @ApiResponse({ status: 201, description: 'Materi generated' })
    async generate(@CurrentUser() user: CurrentUserData, @Body() dto: GenerateMateriDto) {
        return this.materiService.generate(user.id, dto);
    }

    @Post('generate/stream')
    @ApiOperation({ summary: 'Generate materi with AI (Streaming)' })
    @ApiResponse({ status: 200, description: 'Streaming content' })
    async generateStream(
        @CurrentUser() user: CurrentUserData,
        @Body() dto: GenerateMateriDto,
        @Res() res: Response,
    ) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
            for await (const chunk of this.materiService.generateStream(user.id, dto)) {
                res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            }
            res.write('data: [DONE]\n\n');
            res.end();
        } catch (error) {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update materi' })
    @ApiResponse({ status: 200, description: 'Materi updated' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateMateriDto,
    ) {
        return this.materiService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete materi' })
    @ApiResponse({ status: 200, description: 'Materi deleted' })
    async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.materiService.remove(id, user.id);
    }
}
