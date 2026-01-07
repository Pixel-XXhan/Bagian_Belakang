import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    ExportDocumentDto,
    GenerateAndExportDto,
    ExportResponse,
    ExportFormat,
    DocumentType,
} from './dto/export.dto';
import PDFDocument from 'pdfkit';
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
} from 'docx';

@Injectable()
export class ExportService {
    private readonly logger = new Logger(ExportService.name);
    private readonly BUCKET_NAME = 'exports';

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    /**
     * Export existing document to PDF/DOCX
     */
    async exportDocument(userId: string, dto: ExportDocumentDto): Promise<ExportResponse> {
        // Get document from database
        const document = await this.getDocument(userId, dto.document_id, dto.document_type);

        if (!document) {
            throw new NotFoundException('Dokumen tidak ditemukan');
        }

        // Generate file
        const buffer = dto.format === ExportFormat.PDF
            ? await this.generatePDF(document, dto.document_type)
            : await this.generateDOCX(document, dto.document_type);

        // Upload to Supabase Storage
        const filename = this.generateFilename(dto.document_type, dto.format, document.judul || document.id);
        const downloadUrl = await this.uploadToStorage(userId, filename, buffer, dto.format);

        return {
            download_url: downloadUrl,
            filename,
            format: dto.format,
            size: buffer.length,
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        };
    }

    /**
     * Generate content with AI and export directly to PDF/DOCX
     */
    async generateAndExport(userId: string, dto: GenerateAndExportDto): Promise<ExportResponse> {
        // Generate content using AI
        const content = await this.generateContent(dto);

        // Create document object
        const document = {
            judul: dto.topik,
            mapel: dto.mapel,
            kelas: dto.kelas,
            kurikulum: dto.kurikulum || 'Kurikulum Merdeka',
            alokasi_waktu: dto.alokasi_waktu || 90,
            konten_lengkap: content,
            created_at: new Date().toISOString(),
        };

        // Generate file
        const buffer = dto.format === ExportFormat.PDF
            ? await this.generatePDF(document, dto.document_type)
            : await this.generateDOCX(document, dto.document_type);

        // Upload to Supabase Storage
        const filename = this.generateFilename(dto.document_type, dto.format, dto.topik);
        const downloadUrl = await this.uploadToStorage(userId, filename, buffer, dto.format);

        // Save to database
        await this.saveDocument(userId, dto.document_type, document);

        return {
            download_url: downloadUrl,
            filename,
            format: dto.format,
            size: buffer.length,
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        };
    }

    /**
     * Generate content using AI
     */
    private async generateContent(dto: GenerateAndExportDto): Promise<any> {
        const prompts: Record<DocumentType, string> = {
            [DocumentType.RPP]: `Buatkan RPP (Rencana Pelaksanaan Pembelajaran) lengkap untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}
- Kurikulum: ${dto.kurikulum || 'Kurikulum Merdeka'}
- Alokasi Waktu: ${dto.alokasi_waktu || 90} menit

Berikan dalam format JSON dengan struktur:
{
  "identitas": {...},
  "tujuan_pembelajaran": [...],
  "profil_pelajar_pancasila": [...],
  "kegiatan_pembelajaran": { "pendahuluan": "...", "inti": "...", "penutup": "..." },
  "asesmen": {...},
  "refleksi": "..."
}`,
            [DocumentType.SILABUS]: `Buatkan Silabus lengkap untuk:
- Mata Pelajaran: ${dto.mapel}
- Kelas: ${dto.kelas}
- Kurikulum: ${dto.kurikulum || 'Kurikulum Merdeka'}

Berikan dalam format JSON.`,
            [DocumentType.MODUL_AJAR]: `Buatkan Modul Ajar lengkap untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}

Berikan dalam format JSON.`,
            [DocumentType.LKPD]: `Buatkan LKPD (Lembar Kerja Peserta Didik) untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}

Berikan dalam format JSON.`,
            [DocumentType.KISI_KISI]: `Buatkan Kisi-Kisi Soal untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}

Berikan dalam format JSON.`,
        };

        const response = await this.geminiService.chat({
            model: (dto.model || 'gemini-2.5-flash') as 'gemini-2.5-flash',
            messages: [{ role: 'user', content: prompts[dto.document_type] }],
            systemInstruction: 'Kamu adalah asisten guru profesional Indonesia. Berikan output dalam format JSON yang valid.',
            responseFormat: { type: 'json_object' },
        });

        try {
            return JSON.parse(response.content);
        } catch {
            return { raw_content: response.content };
        }
    }

    /**
     * Generate PDF from document content
     */
    private async generatePDF(document: any, type: DocumentType): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(18).font('Helvetica-Bold').text(this.getDocumentTitle(type), { align: 'center' });
            doc.moveDown();

            // Document Title
            doc.fontSize(14).font('Helvetica-Bold').text(document.judul || 'Untitled', { align: 'center' });
            doc.moveDown();

            // Identitas
            doc.fontSize(11).font('Helvetica');
            if (document.mapel) doc.text(`Mata Pelajaran: ${document.mapel}`);
            if (document.kelas) doc.text(`Kelas: ${document.kelas}`);
            if (document.kurikulum) doc.text(`Kurikulum: ${document.kurikulum}`);
            if (document.alokasi_waktu) doc.text(`Alokasi Waktu: ${document.alokasi_waktu} menit`);
            doc.moveDown();

            // Content
            const content = document.konten_lengkap || document.konten || {};
            this.addContentToPDF(doc, content);

            // Footer
            doc.moveDown(2);
            doc.fontSize(9).fillColor('gray').text(`Dibuat: ${new Date().toLocaleDateString('id-ID')}`, { align: 'right' });

            doc.end();
        });
    }

    /**
     * Add content sections to PDF
     */
    private addContentToPDF(doc: PDFKit.PDFDocument, content: any, level = 0): void {
        if (typeof content === 'string') {
            doc.fontSize(10).font('Helvetica').fillColor('black').text(content, { align: 'justify' });
            doc.moveDown(0.5);
            return;
        }

        if (Array.isArray(content)) {
            content.forEach((item, index) => {
                if (typeof item === 'string') {
                    doc.fontSize(10).font('Helvetica').fillColor('black').text(`${index + 1}. ${item}`);
                } else {
                    this.addContentToPDF(doc, item, level + 1);
                }
            });
            doc.moveDown(0.5);
            return;
        }

        if (typeof content === 'object' && content !== null) {
            Object.entries(content).forEach(([key, value]) => {
                const title = this.formatSectionTitle(key);
                doc.fontSize(11).font('Helvetica-Bold').fillColor('black').text(title);
                doc.moveDown(0.3);
                this.addContentToPDF(doc, value, level + 1);
                doc.moveDown(0.5);
            });
        }
    }

    /**
     * Generate DOCX from document content
     */
    private async generateDOCX(document: any, type: DocumentType): Promise<Buffer> {
        const children: Paragraph[] = [];

        // Title
        children.push(
            new Paragraph({
                text: this.getDocumentTitle(type),
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
            }),
        );

        children.push(
            new Paragraph({
                text: document.judul || 'Untitled',
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
            }),
        );

        // Identitas
        if (document.mapel) {
            children.push(new Paragraph({ text: `Mata Pelajaran: ${document.mapel}` }));
        }
        if (document.kelas) {
            children.push(new Paragraph({ text: `Kelas: ${document.kelas}` }));
        }
        if (document.kurikulum) {
            children.push(new Paragraph({ text: `Kurikulum: ${document.kurikulum}` }));
        }
        if (document.alokasi_waktu) {
            children.push(new Paragraph({ text: `Alokasi Waktu: ${document.alokasi_waktu} menit` }));
        }

        children.push(new Paragraph({ text: '' }));

        // Content
        const content = document.konten_lengkap || document.konten || {};
        this.addContentToDOCX(children, content);

        // Footer
        children.push(new Paragraph({ text: '' }));
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Dibuat: ${new Date().toLocaleDateString('id-ID')}`,
                        italics: true,
                        size: 18,
                    }),
                ],
                alignment: AlignmentType.RIGHT,
            }),
        );

        const doc = new Document({
            sections: [{ children }],
        });

        return await Packer.toBuffer(doc);
    }

    /**
     * Add content sections to DOCX
     */
    private addContentToDOCX(children: Paragraph[], content: any, level = 0): void {
        if (typeof content === 'string') {
            children.push(new Paragraph({ text: content }));
            return;
        }

        if (Array.isArray(content)) {
            content.forEach((item, index) => {
                if (typeof item === 'string') {
                    children.push(new Paragraph({ text: `${index + 1}. ${item}` }));
                } else {
                    this.addContentToDOCX(children, item, level + 1);
                }
            });
            return;
        }

        if (typeof content === 'object' && content !== null) {
            Object.entries(content).forEach(([key, value]) => {
                children.push(
                    new Paragraph({
                        text: this.formatSectionTitle(key),
                        heading: level === 0 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
                    }),
                );
                this.addContentToDOCX(children, value, level + 1);
                children.push(new Paragraph({ text: '' }));
            });
        }
    }

    /**
     * Upload file to Supabase Storage
     */
    private async uploadToStorage(
        userId: string,
        filename: string,
        buffer: Buffer,
        format: ExportFormat,
    ): Promise<string> {
        const path = `${userId}/${filename}`;
        const contentType = format === ExportFormat.PDF ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        const { data, error } = await this.supabaseService
            .getClient()
            .storage.from(this.BUCKET_NAME)
            .upload(path, buffer, {
                contentType,
                upsert: true,
            });

        if (error) {
            this.logger.error('Failed to upload to storage:', error.message);
            throw new BadRequestException('Gagal mengupload file ke storage');
        }

        // Get signed URL (valid for 1 hour)
        const { data: signedData, error: signedError } = await this.supabaseService
            .getClient()
            .storage.from(this.BUCKET_NAME)
            .createSignedUrl(path, 3600);

        if (signedError) {
            this.logger.error('Failed to create signed URL:', signedError.message);
            throw new BadRequestException('Gagal membuat URL download');
        }

        return signedData.signedUrl;
    }

    /**
     * Get document from database
     */
    private async getDocument(userId: string, documentId: string, type: DocumentType): Promise<any> {
        const tableMap: Record<DocumentType, string> = {
            [DocumentType.RPP]: 'rpp',
            [DocumentType.SILABUS]: 'silabus',
            [DocumentType.MODUL_AJAR]: 'modul_ajar',
            [DocumentType.LKPD]: 'lkpd',
            [DocumentType.KISI_KISI]: 'kisi_kisi',
        };

        const { data, error } = await this.supabaseService
            .getClient()
            .from(tableMap[type])
            .select('*')
            .eq('id', documentId)
            .eq('user_id', userId)
            .single();

        if (error) return null;
        return data;
    }

    /**
     * Save document to database
     */
    private async saveDocument(userId: string, type: DocumentType, document: any): Promise<void> {
        const tableMap: Record<DocumentType, string> = {
            [DocumentType.RPP]: 'rpp',
            [DocumentType.SILABUS]: 'silabus',
            [DocumentType.MODUL_AJAR]: 'modul_ajar',
            [DocumentType.LKPD]: 'lkpd',
            [DocumentType.KISI_KISI]: 'kisi_kisi',
        };

        await this.supabaseService
            .getClient()
            .from(tableMap[type])
            .insert({
                user_id: userId,
                judul: document.judul,
                kelas: document.kelas,
                konten_lengkap: document.konten_lengkap,
                status: 'published',
            });
    }

    /**
     * Generate filename
     */
    private generateFilename(type: DocumentType, format: ExportFormat, title: string): string {
        const sanitized = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 50);
        const timestamp = Date.now();
        return `${type}_${sanitized}_${timestamp}.${format}`;
    }

    /**
     * Get document title based on type
     */
    private getDocumentTitle(type: DocumentType): string {
        const titles: Record<DocumentType, string> = {
            [DocumentType.RPP]: 'RENCANA PELAKSANAAN PEMBELAJARAN',
            [DocumentType.SILABUS]: 'SILABUS',
            [DocumentType.MODUL_AJAR]: 'MODUL AJAR',
            [DocumentType.LKPD]: 'LEMBAR KERJA PESERTA DIDIK',
            [DocumentType.KISI_KISI]: 'KISI-KISI SOAL',
        };
        return titles[type];
    }

    /**
     * Format section title
     */
    private formatSectionTitle(key: string): string {
        return key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    }
}
