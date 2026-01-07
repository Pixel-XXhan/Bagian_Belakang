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
import { BankSoalService } from './bank-soal.service';
import {
    CreateSoalDto,
    UpdateSoalDto,
    GenerateSoalDto,
    SoalQueryDto,
} from './dto/bank-soal.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('Bank Soal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/bank-soal')
export class BankSoalController {
    constructor(private readonly bankSoalService: BankSoalService) { }

    @Get()
    @ApiOperation({ summary: 'List soal', description: 'Get all soal with filters' })
    @ApiResponse({ status: 200, description: 'List of soal' })
    async findAll(@CurrentUser() user: CurrentUserData, @Query() query: SoalQueryDto) {
        return this.bankSoalService.findAll(user.id, query);
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Get soal statistics', description: 'Get statistics by tipe and tingkat kesulitan' })
    @ApiResponse({ status: 200, description: 'Statistics' })
    async getStatistics(@CurrentUser() user: CurrentUserData) {
        return this.bankSoalService.getStatistics(user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get soal by ID' })
    @ApiResponse({ status: 200, description: 'Soal detail' })
    async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.bankSoalService.findOne(id, user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Create soal manually' })
    @ApiResponse({ status: 201, description: 'Soal created' })
    async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateSoalDto) {
        return this.bankSoalService.create(user.id, dto);
    }

    @Post('bulk')
    @ApiOperation({ summary: 'Create multiple soal', description: 'Bulk insert soal' })
    @ApiResponse({ status: 201, description: 'Soal created' })
    async createBulk(@CurrentUser() user: CurrentUserData, @Body() dtos: CreateSoalDto[]) {
        return this.bankSoalService.createBulk(user.id, dtos);
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate soal with AI', description: 'Generate multiple questions using AI' })
    @ApiResponse({ status: 201, description: 'Soal generated' })
    async generate(@CurrentUser() user: CurrentUserData, @Body() dto: GenerateSoalDto) {
        return this.bankSoalService.generate(user.id, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update soal' })
    @ApiResponse({ status: 200, description: 'Soal updated' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateSoalDto,
    ) {
        return this.bankSoalService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete soal' })
    @ApiResponse({ status: 200, description: 'Soal deleted' })
    async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.bankSoalService.remove(id, user.id);
    }
}
