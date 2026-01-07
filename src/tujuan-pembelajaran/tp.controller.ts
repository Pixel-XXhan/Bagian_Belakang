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
import { TujuanPembelajaranService } from './tp.service';
import {
    CreateTujuanPembelajaranDto,
    UpdateTujuanPembelajaranDto,
    GenerateTujuanPembelajaranDto,
    TujuanPembelajaranQueryDto,
} from './dto/tp.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('Tujuan Pembelajaran')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/tp')
export class TujuanPembelajaranController {
    constructor(private readonly tpService: TujuanPembelajaranService) { }

    @Get()
    @ApiOperation({ summary: 'List tujuan pembelajaran' })
    @ApiResponse({ status: 200, description: 'List of TP' })
    async findAll(@CurrentUser() user: CurrentUserData, @Query() query: TujuanPembelajaranQueryDto) {
        return this.tpService.findAll(user.id, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get TP by ID' })
    @ApiResponse({ status: 200, description: 'TP detail' })
    async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.tpService.findOne(id, user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Create TP manually' })
    @ApiResponse({ status: 201, description: 'TP created' })
    async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateTujuanPembelajaranDto) {
        return this.tpService.create(user.id, dto);
    }

    @Post('bulk')
    @ApiOperation({ summary: 'Create multiple TP' })
    @ApiResponse({ status: 201, description: 'TPs created' })
    async createBulk(@CurrentUser() user: CurrentUserData, @Body() dtos: CreateTujuanPembelajaranDto[]) {
        return this.tpService.createBulk(user.id, dtos);
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate TP with AI', description: 'Generate multiple tujuan pembelajaran using AI' })
    @ApiResponse({ status: 201, description: 'TPs generated' })
    async generate(@CurrentUser() user: CurrentUserData, @Body() dto: GenerateTujuanPembelajaranDto) {
        return this.tpService.generate(user.id, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update TP' })
    @ApiResponse({ status: 200, description: 'TP updated' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateTujuanPembelajaranDto,
    ) {
        return this.tpService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete TP' })
    @ApiResponse({ status: 200, description: 'TP deleted' })
    async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.tpService.remove(id, user.id);
    }
}
