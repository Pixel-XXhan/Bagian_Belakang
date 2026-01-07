import {
    Controller,
    Post,
    Body,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { ExportService } from './export.service';
import {
    ExportDocumentDto,
    GenerateAndExportDto,
    ExportResponse,
} from './dto/export.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('Export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/export')
export class ExportController {
    constructor(private readonly exportService: ExportService) { }

    @Post('document')
    @ApiOperation({
        summary: 'Export existing document to PDF/DOCX',
        description: 'Export dokumen yang sudah ada ke format PDF atau DOCX dan return link download dari Supabase Storage',
    })
    @ApiResponse({
        status: 201,
        description: 'Export berhasil, return download URL',
        type: ExportResponse,
    })
    @ApiResponse({ status: 404, description: 'Dokumen tidak ditemukan' })
    async exportDocument(
        @CurrentUser() user: CurrentUserData,
        @Body() dto: ExportDocumentDto,
    ): Promise<ExportResponse> {
        return this.exportService.exportDocument(user.id, dto);
    }

    @Post('generate')
    @ApiOperation({
        summary: 'Generate and export document (AI → PDF/DOCX → Download Link)',
        description: 'Generate dokumen menggunakan AI, convert ke PDF/DOCX, upload ke Supabase Storage, dan return link download',
    })
    @ApiResponse({
        status: 201,
        description: 'Generate dan export berhasil',
        type: ExportResponse,
    })
    async generateAndExport(
        @CurrentUser() user: CurrentUserData,
        @Body() dto: GenerateAndExportDto,
    ): Promise<ExportResponse> {
        return this.exportService.generateAndExport(user.id, dto);
    }
}
