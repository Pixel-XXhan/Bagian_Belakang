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
import { BahanAjarService } from './bahan-ajar.service';
import {
    CreateBahanAjarDto,
    UpdateBahanAjarDto,
    GenerateBahanAjarDto,
    BahanAjarQueryDto,
} from './dto/bahan-ajar.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('Bahan Ajar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/bahan-ajar')
export class BahanAjarController {
    constructor(private readonly bahanAjarService: BahanAjarService) { }

    @Get()
    @ApiOperation({ summary: 'List bahan ajar' })
    @ApiResponse({ status: 200, description: 'List of bahan ajar' })
    async findAll(@CurrentUser() user: CurrentUserData, @Query() query: BahanAjarQueryDto) {
        return this.bahanAjarService.findAll(user.id, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get bahan ajar by ID' })
    @ApiResponse({ status: 200, description: 'Bahan ajar detail' })
    async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.bahanAjarService.findOne(id, user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Create bahan ajar manually' })
    @ApiResponse({ status: 201, description: 'Bahan ajar created' })
    async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateBahanAjarDto) {
        return this.bahanAjarService.create(user.id, dto);
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate bahan ajar with AI' })
    @ApiResponse({ status: 201, description: 'Bahan ajar generated' })
    async generate(@CurrentUser() user: CurrentUserData, @Body() dto: GenerateBahanAjarDto) {
        return this.bahanAjarService.generate(user.id, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update bahan ajar' })
    @ApiResponse({ status: 200, description: 'Bahan ajar updated' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateBahanAjarDto,
    ) {
        return this.bahanAjarService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete bahan ajar' })
    @ApiResponse({ status: 200, description: 'Bahan ajar deleted' })
    async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.bahanAjarService.remove(id, user.id);
    }
}
