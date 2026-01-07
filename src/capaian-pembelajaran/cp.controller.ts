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
import { CapaianPembelajaranService } from './cp.service';
import {
    CreateCapaianPembelajaranDto,
    UpdateCapaianPembelajaranDto,
    GetCapaianPembelajaranDto,
    CapaianPembelajaranQueryDto,
} from './dto/cp.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('Capaian Pembelajaran')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/cp')
export class CapaianPembelajaranController {
    constructor(private readonly cpService: CapaianPembelajaranService) { }

    @Get()
    @ApiOperation({ summary: 'List saved CP' })
    @ApiResponse({ status: 200, description: 'List of CP' })
    async findAll(@CurrentUser() user: CurrentUserData, @Query() query: CapaianPembelajaranQueryDto) {
        return this.cpService.findAll(user.id, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get CP by ID' })
    @ApiResponse({ status: 200, description: 'CP detail' })
    async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.cpService.findOne(id, user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Save CP manually' })
    @ApiResponse({ status: 201, description: 'CP saved' })
    async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateCapaianPembelajaranDto) {
        return this.cpService.create(user.id, dto);
    }

    @Post('lookup')
    @ApiOperation({ summary: 'Get CP from Kurikulum Merdeka', description: 'Retrieve official CP using AI' })
    @ApiResponse({ status: 200, description: 'CP from Kurikulum' })
    async lookup(@Body() dto: GetCapaianPembelajaranDto) {
        return this.cpService.getFromKurikulum(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update CP' })
    @ApiResponse({ status: 200, description: 'CP updated' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateCapaianPembelajaranDto,
    ) {
        return this.cpService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete CP' })
    @ApiResponse({ status: 200, description: 'CP deleted' })
    async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.cpService.remove(id, user.id);
    }
}
