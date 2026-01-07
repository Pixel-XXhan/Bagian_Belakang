import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KelasService } from './kelas.service';
import { CreateKelasDto, UpdateKelasDto, KelasQueryDto } from './dto/kelas.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Kelas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/kelas')
export class KelasController {
    constructor(private readonly kelasService: KelasService) { }

    @Get()
    @ApiOperation({ summary: 'List semua kelas' })
    @ApiResponse({ status: 200, description: 'List of kelas' })
    async findAll(@Query() query: KelasQueryDto) {
        return this.kelasService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get kelas by ID' })
    async findOne(@Param('id') id: string) {
        return this.kelasService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create kelas' })
    async create(@Body() dto: CreateKelasDto) {
        return this.kelasService.create(dto);
    }

    @Post('seed')
    @ApiOperation({ summary: 'Seed default kelas (1-12)' })
    async seed() {
        return this.kelasService.seed();
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update kelas' })
    async update(@Param('id') id: string, @Body() dto: UpdateKelasDto) {
        return this.kelasService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete kelas' })
    async remove(@Param('id') id: string) {
        return this.kelasService.remove(id);
    }
}
