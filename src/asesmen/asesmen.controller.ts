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
import { AsesmenService } from './asesmen.service';
import {
    CreateAsesmenDto,
    UpdateAsesmenDto,
    GenerateAsesmenDto,
    AsesmenQueryDto,
} from './dto/asesmen.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('Asesmen')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/asesmen')
export class AsesmenController {
    constructor(private readonly asesmenService: AsesmenService) { }

    @Get()
    @ApiOperation({ summary: 'List asesmen', description: 'Get all asesmen with filters' })
    @ApiResponse({ status: 200, description: 'List of asesmen' })
    async findAll(@CurrentUser() user: CurrentUserData, @Query() query: AsesmenQueryDto) {
        return this.asesmenService.findAll(user.id, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get asesmen by ID' })
    @ApiResponse({ status: 200, description: 'Asesmen detail' })
    async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.asesmenService.findOne(id, user.id);
    }

    @Get(':id/with-soal')
    @ApiOperation({ summary: 'Get asesmen with soal', description: 'Get asesmen detail including all soal' })
    @ApiResponse({ status: 200, description: 'Asesmen with soal' })
    async findOneWithSoal(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.asesmenService.findOneWithSoal(id, user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Create asesmen manually' })
    @ApiResponse({ status: 201, description: 'Asesmen created' })
    async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateAsesmenDto) {
        return this.asesmenService.create(user.id, dto);
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate asesmen with AI', description: 'Generate asesmen dengan rubrik dan soal' })
    @ApiResponse({ status: 201, description: 'Asesmen generated' })
    async generate(@CurrentUser() user: CurrentUserData, @Body() dto: GenerateAsesmenDto) {
        return this.asesmenService.generate(user.id, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update asesmen' })
    @ApiResponse({ status: 200, description: 'Asesmen updated' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateAsesmenDto,
    ) {
        return this.asesmenService.update(id, user.id, dto);
    }

    @Post(':id/soal')
    @ApiOperation({ summary: 'Add soal to asesmen', description: 'Link soal from bank soal to asesmen' })
    @ApiResponse({ status: 200, description: 'Soal added' })
    async addSoal(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
        @Body() body: { soal_ids: string[] },
    ) {
        return this.asesmenService.addSoal(id, user.id, body.soal_ids);
    }

    @Delete(':id/soal/:soalId')
    @ApiOperation({ summary: 'Remove soal from asesmen' })
    @ApiResponse({ status: 200, description: 'Soal removed' })
    async removeSoal(
        @Param('id') id: string,
        @Param('soalId') soalId: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.asesmenService.removeSoal(id, user.id, soalId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete asesmen' })
    @ApiResponse({ status: 200, description: 'Asesmen deleted' })
    async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.asesmenService.remove(id, user.id);
    }
}
