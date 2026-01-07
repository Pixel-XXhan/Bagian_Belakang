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
import { KurikulumService } from './kurikulum.service';
import { CreateKurikulumDto, UpdateKurikulumDto } from './dto/kurikulum.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Master Data - Kurikulum')
@Controller('api/v2/kurikulum')
export class KurikulumController {
    constructor(private readonly kurikulumService: KurikulumService) { }

    @Get()
    @Public()
    @ApiOperation({
        summary: 'List all kurikulum',
        description: 'Mendapatkan daftar semua kurikulum yang tersedia',
    })
    @ApiQuery({ name: 'all', required: false, description: 'Include non-active kurikulum' })
    @ApiResponse({ status: 200, description: 'Daftar kurikulum' })
    async findAll(@Query('all') all?: string) {
        const activeOnly = all !== 'true';
        return this.kurikulumService.findAll(activeOnly);
    }

    @Get(':id')
    @Public()
    @ApiOperation({
        summary: 'Get kurikulum by ID',
        description: 'Mendapatkan detail kurikulum berdasarkan ID',
    })
    @ApiResponse({ status: 200, description: 'Detail kurikulum' })
    @ApiResponse({ status: 404, description: 'Kurikulum tidak ditemukan' })
    async findOne(@Param('id') id: string) {
        return this.kurikulumService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Create kurikulum (Admin)',
        description: 'Membuat kurikulum baru (memerlukan autentikasi)',
    })
    @ApiResponse({ status: 201, description: 'Kurikulum berhasil dibuat' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async create(@Body() dto: CreateKurikulumDto) {
        return this.kurikulumService.create(dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update kurikulum (Admin)',
        description: 'Mengupdate kurikulum (memerlukan autentikasi)',
    })
    @ApiResponse({ status: 200, description: 'Kurikulum berhasil diupdate' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Kurikulum tidak ditemukan' })
    async update(@Param('id') id: string, @Body() dto: UpdateKurikulumDto) {
        return this.kurikulumService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete kurikulum (Admin)',
        description: 'Menghapus kurikulum (soft delete)',
    })
    @ApiResponse({ status: 200, description: 'Kurikulum berhasil dihapus' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Kurikulum tidak ditemukan' })
    async remove(@Param('id') id: string) {
        return this.kurikulumService.remove(id);
    }
}
