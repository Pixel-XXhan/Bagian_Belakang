import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SemesterService } from './semester.service';
import { CreateSemesterDto, UpdateSemesterDto } from './dto/semester.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Semester')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/semester')
export class SemesterController {
    constructor(private readonly semesterService: SemesterService) { }

    @Get()
    @ApiOperation({ summary: 'List semester' })
    async findAll() {
        return this.semesterService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get semester by ID' })
    async findOne(@Param('id') id: string) {
        return this.semesterService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create semester' })
    async create(@Body() dto: CreateSemesterDto) {
        return this.semesterService.create(dto);
    }

    @Post('seed')
    @ApiOperation({ summary: 'Seed default semester (Ganjil/Genap)' })
    async seed() {
        return this.semesterService.seed();
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update semester' })
    async update(@Param('id') id: string, @Body() dto: UpdateSemesterDto) {
        return this.semesterService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete semester' })
    async remove(@Param('id') id: string) {
        return this.semesterService.remove(id);
    }
}
