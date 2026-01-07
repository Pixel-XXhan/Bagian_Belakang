import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KompetensiDasarService } from './kd.service';
import { CreateKompetensiDasarDto, UpdateKompetensiDasarDto, GenerateKDDto, KDQueryDto } from './dto/kd.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Kompetensi Dasar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/kd')
export class KompetensiDasarController {
    constructor(private readonly kdService: KompetensiDasarService) { }

    @Get()
    @ApiOperation({ summary: 'List KD' })
    async findAll(@Query() query: KDQueryDto) {
        return this.kdService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get KD by ID' })
    async findOne(@Param('id') id: string) {
        return this.kdService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create KD' })
    async create(@Body() dto: CreateKompetensiDasarDto) {
        return this.kdService.create(dto);
    }

    @Post('lookup')
    @ApiOperation({ summary: 'Lookup KD dari Kurikulum menggunakan AI' })
    async lookup(@Body() dto: GenerateKDDto) {
        return this.kdService.lookup(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update KD' })
    async update(@Param('id') id: string, @Body() dto: UpdateKompetensiDasarDto) {
        return this.kdService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete KD' })
    async remove(@Param('id') id: string) {
        return this.kdService.remove(id);
    }
}
