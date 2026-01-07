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
import { LkpdService } from './lkpd.service';
import {
    CreateLkpdDto,
    UpdateLkpdDto,
    GenerateLkpdDto,
    LkpdQueryDto,
} from './dto/lkpd.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('LKPD')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/lkpd')
export class LkpdController {
    constructor(private readonly lkpdService: LkpdService) { }

    @Get()
    @ApiOperation({ summary: 'List LKPD' })
    @ApiResponse({ status: 200, description: 'List of LKPD' })
    async findAll(@CurrentUser() user: CurrentUserData, @Query() query: LkpdQueryDto) {
        return this.lkpdService.findAll(user.id, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get LKPD by ID' })
    @ApiResponse({ status: 200, description: 'LKPD detail' })
    async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.lkpdService.findOne(id, user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Create LKPD manually' })
    @ApiResponse({ status: 201, description: 'LKPD created' })
    async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateLkpdDto) {
        return this.lkpdService.create(user.id, dto);
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate LKPD with AI' })
    @ApiResponse({ status: 201, description: 'LKPD generated' })
    async generate(@CurrentUser() user: CurrentUserData, @Body() dto: GenerateLkpdDto) {
        return this.lkpdService.generate(user.id, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update LKPD' })
    @ApiResponse({ status: 200, description: 'LKPD updated' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateLkpdDto,
    ) {
        return this.lkpdService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete LKPD' })
    @ApiResponse({ status: 200, description: 'LKPD deleted' })
    async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.lkpdService.remove(id, user.id);
    }
}
