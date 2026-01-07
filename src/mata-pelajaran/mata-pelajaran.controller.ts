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
    ApiQuery,
} from '@nestjs/swagger';
import { MataPelajaranService } from './mata-pelajaran.service';
import { CreateMapelDto, UpdateMapelDto, MapelQueryDto } from './dto/mapel.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Master Data - Mata Pelajaran')
@Controller('api/v2/mapel')
export class MataPelajaranController {
    constructor(private readonly mapelService: MataPelajaranService) { }

    @Get()
    @Public()
    @ApiOperation({
        summary: 'List all mata pelajaran',
        description: 'Mendapatkan daftar mata pelajaran dengan filter opsional',
    })
    @ApiQuery({ name: 'jenjang_id', required: false, description: 'Filter by jenjang' })
    @ApiQuery({ name: 'kurikulum_id', required: false, description: 'Filter by kurikulum' })
    @ApiResponse({ status: 200, description: 'Daftar mata pelajaran' })
    async findAll(@Query() query: MapelQueryDto) {
        return this.mapelService.findAll(query);
    }

    @Get(':id')
    @Public()
    @ApiOperation({
        summary: 'Get mata pelajaran by ID',
        description: 'Mendapatkan detail mata pelajaran',
    })
    @ApiResponse({ status: 200, description: 'Detail mata pelajaran' })
    @ApiResponse({ status: 404, description: 'Mata pelajaran tidak ditemukan' })
    async findOne(@Param('id') id: string) {
        return this.mapelService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Create mata pelajaran',
        description: 'Membuat mata pelajaran baru',
    })
    @ApiResponse({ status: 201, description: 'Mata pelajaran berhasil dibuat' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async create(@Body() dto: CreateMapelDto) {
        return this.mapelService.create(dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update mata pelajaran',
        description: 'Mengupdate mata pelajaran',
    })
    @ApiResponse({ status: 200, description: 'Mata pelajaran berhasil diupdate' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Mata pelajaran tidak ditemukan' })
    async update(@Param('id') id: string, @Body() dto: UpdateMapelDto) {
        return this.mapelService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete mata pelajaran',
        description: 'Menghapus mata pelajaran',
    })
    @ApiResponse({ status: 200, description: 'Mata pelajaran berhasil dihapus' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Mata pelajaran tidak ditemukan' })
    async remove(@Param('id') id: string) {
        return this.mapelService.remove(id);
    }
}
