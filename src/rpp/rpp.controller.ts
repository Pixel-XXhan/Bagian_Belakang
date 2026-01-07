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
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { RppService } from './rpp.service';
import {
    CreateRppDto,
    UpdateRppDto,
    GenerateRppDto,
    RppQueryDto,
} from './dto/rpp.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('RPP')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/rpp')
export class RppController {
    constructor(private readonly rppService: RppService) { }

    @Get()
    @ApiOperation({
        summary: 'List all RPP',
        description: 'Mendapatkan daftar RPP milik user dengan filter opsional',
    })
    @ApiQuery({ name: 'mapel_id', required: false })
    @ApiQuery({ name: 'kelas', required: false })
    @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published'] })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'offset', required: false })
    @ApiResponse({ status: 200, description: 'Daftar RPP' })
    async findAll(
        @CurrentUser() user: CurrentUserData,
        @Query() query: RppQueryDto,
    ) {
        return this.rppService.findAll(user.id, query);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get RPP by ID',
        description: 'Mendapatkan detail RPP',
    })
    @ApiResponse({ status: 200, description: 'Detail RPP' })
    @ApiResponse({ status: 404, description: 'RPP tidak ditemukan' })
    async findOne(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.rppService.findOne(id, user.id);
    }

    @Post()
    @ApiOperation({
        summary: 'Create RPP manually',
        description: 'Membuat RPP baru secara manual',
    })
    @ApiResponse({ status: 201, description: 'RPP berhasil dibuat' })
    async create(
        @CurrentUser() user: CurrentUserData,
        @Body() dto: CreateRppDto,
    ) {
        return this.rppService.create(user.id, dto);
    }

    @Post('generate')
    @ApiOperation({
        summary: 'Generate RPP with AI',
        description: 'Generate RPP menggunakan AI (Gemini)',
    })
    @ApiResponse({ status: 201, description: 'RPP berhasil di-generate' })
    async generate(
        @CurrentUser() user: CurrentUserData,
        @Body() dto: GenerateRppDto,
    ) {
        return this.rppService.generate(user.id, dto);
    }

    @Post('generate/stream')
    @ApiOperation({
        summary: 'Generate RPP with AI (Streaming)',
        description: 'Generate RPP menggunakan AI dengan streaming response (SSE)',
    })
    @ApiResponse({ status: 200, description: 'Streaming RPP content' })
    async generateStream(
        @CurrentUser() user: CurrentUserData,
        @Body() dto: GenerateRppDto,
        @Res() res: Response,
    ) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        try {
            const generator = this.rppService.generateStream(user.id, dto);

            for await (const chunk of generator) {
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
    @ApiOperation({
        summary: 'Update RPP',
        description: 'Mengupdate RPP',
    })
    @ApiResponse({ status: 200, description: 'RPP berhasil diupdate' })
    @ApiResponse({ status: 404, description: 'RPP tidak ditemukan' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateRppDto,
    ) {
        return this.rppService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete RPP',
        description: 'Menghapus RPP',
    })
    @ApiResponse({ status: 200, description: 'RPP berhasil dihapus' })
    @ApiResponse({ status: 404, description: 'RPP tidak ditemukan' })
    async remove(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.rppService.remove(id, user.id);
    }

    @Post(':id/duplicate')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Duplicate RPP',
        description: 'Menduplikasi RPP yang sudah ada',
    })
    @ApiResponse({ status: 201, description: 'RPP berhasil diduplikasi' })
    @ApiResponse({ status: 404, description: 'RPP tidak ditemukan' })
    async duplicate(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.rppService.duplicate(id, user.id);
    }
}
