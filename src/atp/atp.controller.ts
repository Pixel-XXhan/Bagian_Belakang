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
import { AtpService } from './atp.service';
import {
    CreateAtpDto,
    UpdateAtpDto,
    GenerateAtpDto,
    AtpQueryDto,
} from './dto/atp.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('ATP (Alur Tujuan Pembelajaran)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/atp')
export class AtpController {
    constructor(private readonly atpService: AtpService) { }

    @Get()
    @ApiOperation({ summary: 'List ATP' })
    @ApiResponse({ status: 200, description: 'List of ATP' })
    async findAll(@CurrentUser() user: CurrentUserData, @Query() query: AtpQueryDto) {
        return this.atpService.findAll(user.id, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get ATP by ID' })
    @ApiResponse({ status: 200, description: 'ATP detail' })
    async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.atpService.findOne(id, user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Create ATP manually' })
    @ApiResponse({ status: 201, description: 'ATP created' })
    async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateAtpDto) {
        return this.atpService.create(user.id, dto);
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate ATP with AI' })
    @ApiResponse({ status: 201, description: 'ATP generated' })
    async generate(@CurrentUser() user: CurrentUserData, @Body() dto: GenerateAtpDto) {
        return this.atpService.generate(user.id, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update ATP' })
    @ApiResponse({ status: 200, description: 'ATP updated' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateAtpDto,
    ) {
        return this.atpService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete ATP' })
    @ApiResponse({ status: 200, description: 'ATP deleted' })
    async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.atpService.remove(id, user.id);
    }
}
