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
import { ModulAjarService } from './modul-ajar.service';
import {
    CreateModulAjarDto,
    UpdateModulAjarDto,
    GenerateModulAjarDto,
    ModulAjarQueryDto,
} from './dto/modul-ajar.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('Modul Ajar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/modul-ajar')
export class ModulAjarController {
    constructor(private readonly modulAjarService: ModulAjarService) { }

    @Get()
    @ApiOperation({ summary: 'List modul ajar', description: 'Get all modul ajar for current user' })
    @ApiResponse({ status: 200, description: 'List of modul ajar' })
    async findAll(@CurrentUser() user: CurrentUserData, @Query() query: ModulAjarQueryDto) {
        return this.modulAjarService.findAll(user.id, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get modul ajar by ID' })
    @ApiResponse({ status: 200, description: 'Modul ajar detail' })
    async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.modulAjarService.findOne(id, user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Create modul ajar manually' })
    @ApiResponse({ status: 201, description: 'Modul ajar created' })
    async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateModulAjarDto) {
        return this.modulAjarService.create(user.id, dto);
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate modul ajar with AI' })
    @ApiResponse({ status: 201, description: 'Modul ajar generated' })
    async generate(@CurrentUser() user: CurrentUserData, @Body() dto: GenerateModulAjarDto) {
        return this.modulAjarService.generate(user.id, dto);
    }

    @Post('generate/stream')
    @ApiOperation({ summary: 'Generate modul ajar with AI (Streaming)' })
    @ApiResponse({ status: 200, description: 'Streaming content' })
    async generateStream(
        @CurrentUser() user: CurrentUserData,
        @Body() dto: GenerateModulAjarDto,
        @Res() res: Response,
    ) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
            for await (const chunk of this.modulAjarService.generateStream(user.id, dto)) {
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
    @ApiOperation({ summary: 'Update modul ajar' })
    @ApiResponse({ status: 200, description: 'Modul ajar updated' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateModulAjarDto,
    ) {
        return this.modulAjarService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete modul ajar' })
    @ApiResponse({ status: 200, description: 'Modul ajar deleted' })
    async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.modulAjarService.remove(id, user.id);
    }
}
