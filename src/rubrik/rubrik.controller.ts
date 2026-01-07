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
import { RubrikService } from './rubrik.service';
import {
    CreateRubrikDto,
    UpdateRubrikDto,
    GenerateRubrikDto,
    RubrikQueryDto,
} from './dto/rubrik.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('Rubrik Penilaian')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/rubrik')
export class RubrikController {
    constructor(private readonly rubrikService: RubrikService) { }

    @Get()
    @ApiOperation({ summary: 'List rubrik' })
    @ApiResponse({ status: 200, description: 'List of rubrik' })
    async findAll(@CurrentUser() user: CurrentUserData, @Query() query: RubrikQueryDto) {
        return this.rubrikService.findAll(user.id, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get rubrik by ID' })
    @ApiResponse({ status: 200, description: 'Rubrik detail' })
    async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.rubrikService.findOne(id, user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Create rubrik manually' })
    @ApiResponse({ status: 201, description: 'Rubrik created' })
    async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateRubrikDto) {
        return this.rubrikService.create(user.id, dto);
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate rubrik with AI' })
    @ApiResponse({ status: 201, description: 'Rubrik generated' })
    async generate(@CurrentUser() user: CurrentUserData, @Body() dto: GenerateRubrikDto) {
        return this.rubrikService.generate(user.id, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update rubrik' })
    @ApiResponse({ status: 200, description: 'Rubrik updated' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateRubrikDto,
    ) {
        return this.rubrikService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete rubrik' })
    @ApiResponse({ status: 200, description: 'Rubrik deleted' })
    async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.rubrikService.remove(id, user.id);
    }
}
