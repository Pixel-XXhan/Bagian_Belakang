import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TemplateService } from './template.service';
import {
    CreateTemplateDto,
    UpdateTemplateDto,
    TemplateQueryDto,
    UseTemplateDto,
    TemplateCategory
} from './dto/template.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('Template Library')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/template')
export class TemplateController {
    constructor(private readonly templateService: TemplateService) { }

    @Get()
    @ApiOperation({ summary: 'List semua template (publik + milik sendiri)' })
    async findAll(@CurrentUser() user: CurrentUserData, @Query() query: TemplateQueryDto) {
        return this.templateService.findAll(user.id, query);
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Statistik template' })
    async getStatistics(@CurrentUser() user: CurrentUserData) {
        return this.templateService.getStatistics(user.id);
    }

    @Get('category/:kategori')
    @ApiOperation({ summary: 'List template by kategori' })
    async findByCategory(
        @CurrentUser() user: CurrentUserData,
        @Param('kategori') kategori: TemplateCategory,
    ) {
        return this.templateService.findByCategory(kategori, user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get template by ID' })
    async findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
        return this.templateService.findOne(id, user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Buat template baru' })
    async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateTemplateDto) {
        return this.templateService.create(user.id, dto);
    }

    @Post('use')
    @ApiOperation({ summary: 'Gunakan template untuk membuat dokumen' })
    async useTemplate(@CurrentUser() user: CurrentUserData, @Body() dto: UseTemplateDto) {
        return this.templateService.useTemplate(user.id, dto);
    }

    @Post('seed')
    @ApiOperation({ summary: 'Seed template default (system templates)' })
    async seed() {
        return this.templateService.seedDefaultTemplates();
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update template' })
    async update(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
        @Body() dto: UpdateTemplateDto,
    ) {
        return this.templateService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Hapus template' })
    async remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
        return this.templateService.remove(id, user.id);
    }
}
