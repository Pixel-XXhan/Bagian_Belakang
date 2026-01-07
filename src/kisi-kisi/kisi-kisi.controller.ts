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
import { KisiKisiService } from './kisi-kisi.service';
import {
    CreateKisiKisiDto,
    UpdateKisiKisiDto,
    GenerateKisiKisiDto,
    KisiKisiQueryDto,
} from './dto/kisi-kisi.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('Kisi-Kisi Soal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/kisi-kisi')
export class KisiKisiController {
    constructor(private readonly kisiKisiService: KisiKisiService) { }

    @Get()
    @ApiOperation({ summary: 'List kisi-kisi' })
    @ApiResponse({ status: 200, description: 'List of kisi-kisi' })
    async findAll(@CurrentUser() user: CurrentUserData, @Query() query: KisiKisiQueryDto) {
        return this.kisiKisiService.findAll(user.id, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get kisi-kisi by ID' })
    @ApiResponse({ status: 200, description: 'Kisi-kisi detail' })
    async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.kisiKisiService.findOne(id, user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Create kisi-kisi manually' })
    @ApiResponse({ status: 201, description: 'Kisi-kisi created' })
    async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateKisiKisiDto) {
        return this.kisiKisiService.create(user.id, dto);
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate kisi-kisi with AI' })
    @ApiResponse({ status: 201, description: 'Kisi-kisi generated' })
    async generate(@CurrentUser() user: CurrentUserData, @Body() dto: GenerateKisiKisiDto) {
        return this.kisiKisiService.generate(user.id, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update kisi-kisi' })
    @ApiResponse({ status: 200, description: 'Kisi-kisi updated' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateKisiKisiDto,
    ) {
        return this.kisiKisiService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete kisi-kisi' })
    @ApiResponse({ status: 200, description: 'Kisi-kisi deleted' })
    async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.kisiKisiService.remove(id, user.id);
    }
}
