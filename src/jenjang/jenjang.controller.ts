import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { JenjangService } from './jenjang.service';
import { CreateJenjangDto, UpdateJenjangDto } from './dto/jenjang.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Master Data - Jenjang')
@Controller('api/v2/jenjang')
export class JenjangController {
    constructor(private readonly jenjangService: JenjangService) { }

    @Get()
    @Public()
    @ApiOperation({
        summary: 'List all jenjang pendidikan',
        description: 'Mendapatkan daftar jenjang (SD, SMP, SMA, SMK)',
    })
    @ApiResponse({ status: 200, description: 'Daftar jenjang' })
    async findAll() {
        return this.jenjangService.findAll();
    }

    @Get(':id')
    @Public()
    @ApiOperation({
        summary: 'Get jenjang by ID',
        description: 'Mendapatkan detail jenjang',
    })
    @ApiResponse({ status: 200, description: 'Detail jenjang' })
    @ApiResponse({ status: 404, description: 'Jenjang tidak ditemukan' })
    async findOne(@Param('id') id: string) {
        return this.jenjangService.findOne(id);
    }

    @Get(':id/kelas')
    @Public()
    @ApiOperation({
        summary: 'Get kelas by jenjang',
        description: 'Mendapatkan daftar kelas dalam jenjang tertentu',
    })
    @ApiResponse({ status: 200, description: 'Daftar kelas' })
    @ApiResponse({ status: 404, description: 'Jenjang tidak ditemukan' })
    async getKelas(@Param('id') id: string) {
        return this.jenjangService.getKelasByJenjang(id);
    }

    @Get(':id/mapel')
    @Public()
    @ApiOperation({
        summary: 'Get mata pelajaran by jenjang',
        description: 'Mendapatkan daftar mata pelajaran dalam jenjang tertentu',
    })
    @ApiResponse({ status: 200, description: 'Daftar mata pelajaran' })
    @ApiResponse({ status: 404, description: 'Jenjang tidak ditemukan' })
    async getMapel(@Param('id') id: string) {
        return this.jenjangService.getMapelByJenjang(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Create jenjang (Admin)',
        description: 'Membuat jenjang baru',
    })
    @ApiResponse({ status: 201, description: 'Jenjang berhasil dibuat' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async create(@Body() dto: CreateJenjangDto) {
        return this.jenjangService.create(dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update jenjang (Admin)',
        description: 'Mengupdate jenjang',
    })
    @ApiResponse({ status: 200, description: 'Jenjang berhasil diupdate' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Jenjang tidak ditemukan' })
    async update(@Param('id') id: string, @Body() dto: UpdateJenjangDto) {
        return this.jenjangService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete jenjang (Admin)',
        description: 'Menghapus jenjang',
    })
    @ApiResponse({ status: 200, description: 'Jenjang berhasil dihapus' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Jenjang tidak ditemukan' })
    async remove(@Param('id') id: string) {
        return this.jenjangService.remove(id);
    }
}
