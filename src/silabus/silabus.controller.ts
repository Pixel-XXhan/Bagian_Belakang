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
import { SilabusService } from './silabus.service';
import {
    CreateSilabusDto,
    UpdateSilabusDto,
    GenerateSilabusDto,
    SilabusQueryDto,
} from './dto/silabus.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('Silabus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/silabus')
export class SilabusController {
    constructor(private readonly silabusService: SilabusService) { }

    @Get()
    @ApiOperation({ summary: 'List silabus', description: 'Mendapatkan daftar silabus user' })
    @ApiResponse({ status: 200, description: 'Daftar silabus' })
    async findAll(@CurrentUser() user: CurrentUserData, @Query() query: SilabusQueryDto) {
        return this.silabusService.findAll(user.id, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get silabus by ID' })
    @ApiResponse({ status: 200, description: 'Detail silabus' })
    async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.silabusService.findOne(id, user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Create silabus manually' })
    @ApiResponse({ status: 201, description: 'Silabus berhasil dibuat' })
    async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateSilabusDto) {
        return this.silabusService.create(user.id, dto);
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate silabus with AI' })
    @ApiResponse({ status: 201, description: 'Silabus berhasil di-generate' })
    async generate(@CurrentUser() user: CurrentUserData, @Body() dto: GenerateSilabusDto) {
        return this.silabusService.generate(user.id, dto);
    }

    @Post('generate/stream')
    @ApiOperation({ summary: 'Generate silabus with AI (Streaming)' })
    @ApiResponse({ status: 200, description: 'Streaming silabus content' })
    async generateStream(
        @CurrentUser() user: CurrentUserData,
        @Body() dto: GenerateSilabusDto,
        @Res() res: Response,
    ) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
            for await (const chunk of this.silabusService.generateStream(user.id, dto)) {
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
    @ApiOperation({ summary: 'Update silabus' })
    @ApiResponse({ status: 200, description: 'Silabus berhasil diupdate' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateSilabusDto,
    ) {
        return this.silabusService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete silabus' })
    @ApiResponse({ status: 200, description: 'Silabus berhasil dihapus' })
    async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.silabusService.remove(id, user.id);
    }
}
