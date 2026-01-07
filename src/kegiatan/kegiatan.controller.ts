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
} from '@nestjs/swagger';
import { KegiatanService } from './kegiatan.service';
import {
    CreateKegiatanDto,
    UpdateKegiatanDto,
    GenerateKegiatanDto,
    KegiatanQueryDto,
} from './dto/kegiatan.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('Kegiatan Pembelajaran')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/kegiatan')
export class KegiatanController {
    constructor(private readonly kegiatanService: KegiatanService) { }

    @Get()
    @ApiOperation({ summary: 'List kegiatan' })
    @ApiResponse({ status: 200, description: 'List of kegiatan' })
    async findAll(@CurrentUser() user: CurrentUserData, @Query() query: KegiatanQueryDto) {
        return this.kegiatanService.findAll(user.id, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get kegiatan by ID' })
    @ApiResponse({ status: 200, description: 'Kegiatan detail' })
    async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.kegiatanService.findOne(id, user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Create kegiatan manually' })
    @ApiResponse({ status: 201, description: 'Kegiatan created' })
    async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateKegiatanDto) {
        return this.kegiatanService.create(user.id, dto);
    }

    @Post('bulk')
    @ApiOperation({ summary: 'Create multiple kegiatan' })
    @ApiResponse({ status: 201, description: 'Kegiatan created' })
    async createBulk(@CurrentUser() user: CurrentUserData, @Body() dtos: CreateKegiatanDto[]) {
        return this.kegiatanService.createBulk(user.id, dtos);
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate kegiatan with AI', description: 'Generate pendahuluan, inti, penutup' })
    @ApiResponse({ status: 201, description: 'Kegiatan generated' })
    async generate(@CurrentUser() user: CurrentUserData, @Body() dto: GenerateKegiatanDto) {
        return this.kegiatanService.generate(user.id, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update kegiatan' })
    @ApiResponse({ status: 200, description: 'Kegiatan updated' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateKegiatanDto,
    ) {
        return this.kegiatanService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete kegiatan' })
    @ApiResponse({ status: 200, description: 'Kegiatan deleted' })
    async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.kegiatanService.remove(id, user.id);
    }
}
