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
        // Use existing content if provided, otherwise generate using AI
        const content = dto.content ? dto.content : await this.generateContent(dto);

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
            content: content,
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
            [DocumentType.ASESMEN]: `Buatkan dokumen Asesmen lengkap untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}
- Kurikulum: ${dto.kurikulum || 'Kurikulum Merdeka'}

Sertakan rubrik penilaian, instrumen, dan kriteria ketuntasan. Berikan dalam format JSON.`,
            [DocumentType.BANK_SOAL]: `Buatkan Bank Soal lengkap untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}
- Jumlah Soal: ${dto.jumlah_soal || 20}
- Tingkat Kesulitan: ${dto.tingkat_kesulitan || 'Campuran'}

Sertakan kunci jawaban dan pembahasan. Berikan dalam format JSON.`,
            [DocumentType.MATERI]: `Buatkan Ringkasan Materi Lengkap untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}

Berikan dalam format JSON.`,
            [DocumentType.RUBRIK]: `Buatkan Rubrik Penilaian Lengkap untuk:
- Mata Pelajaran: ${dto.mapel}
- Topik: ${dto.topik}
- Kelas: ${dto.kelas}

Berikan dalam format JSON.`,
            [DocumentType.ATP]: `Buatkan Alur Tujuan Pembelajaran (ATP) Lengkap untuk:
- Mata Pelajaran: ${dto.mapel}
- Kelas: ${dto.kelas}

Berikan dalam format JSON.`,
            [DocumentType.TUJUAN_PEMBELAJARAN]: `Buatkan Tujuan Pembelajaran (TP) Lengkap untuk:
- Mata Pelajaran: ${dto.mapel}
- Kelas: ${dto.kelas}

Berikan dalam format JSON.`,
        };

        const response = await this.geminiService.chat({
            model: (dto.model || 'gemini-1.5-flash') as any,
            messages: [{ role: 'user', content: prompts[dto.document_type] }],
            systemInstruction: `Kamu adalah asisten guru profesional Indonesia. Buat dokumen dengan SANGAT MENDETAIL, PANJANG, dan PROFESIONAL.
            Gunakan bahasa akademis yang formatif.
            Pastikan output SANGAT PANJANG untuk memenuhi kebutuhan halaman yang banyak.
            Berikan output dalam format JSON yang valid.`,
            responseFormat: { type: 'json_object' },
            maxTokens: 8192, // Maximize tokens for long content
        });

        try {
            let content = JSON.parse(response.content);

            // Merge manual overrides if present
            if (dto.document_type === DocumentType.RPP) {
                if (dto.tujuan_pembelajaran && dto.tujuan_pembelajaran.length > 0) {
                    content.tujuan_pembelajaran = dto.tujuan_pembelajaran;
                }
                if (dto.materi_pokok) {
                    content.identitas = { ...content.identitas, materi_pokok: dto.materi_pokok };
                }
                if (dto.metode) {
                    content.model_pembelajaran = dto.metode;
                }
                if (dto.kegiatan_pembelajaran) {
                    // Smart merge: Use manual input if available, otherwise keep AI
                    content.kegiatan_pembelajaran = {
                        ...content.kegiatan_pembelajaran,
                        ...dto.kegiatan_pembelajaran
                    };
                }
            }

            return content;
        } catch {
            return { raw_content: response.content };
        }
    }

    /**
     * Generate PDF from document content with Indonesian Standards
     * - Margins: Top 3cm, Bottom 2.5cm, Left 3cm, Right 2.5cm
     * - Font: Times Roman for body, Helvetica Bold for headings
     * - A4 size (595.28 x 841.89 points)
     */
    private async generatePDF(document: any, type: DocumentType): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            // Indonesian standard margins (in points: 1cm ≈ 28.35pt)
            const MARGIN_TOP = 85;      // 3 cm (untuk kop surat)
            const MARGIN_BOTTOM = 71;   // 2.5 cm
            const MARGIN_LEFT = 85;     // 3 cm
            const MARGIN_RIGHT = 71;    // 2.5 cm

            const doc = new PDFDocument({
                size: 'A4',
                margins: {
                    top: MARGIN_TOP,
                    bottom: MARGIN_BOTTOM,
                    left: MARGIN_LEFT,
                    right: MARGIN_RIGHT
                },
                bufferPages: true // Enable page buffering for page numbers
            });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // School Header Placeholder (if school info provided)
            if (document.nama_sekolah) {
                doc.fontSize(12).font('Helvetica-Bold').text(document.nama_sekolah, { align: 'center' });
                if (document.alamat_sekolah) {
                    doc.fontSize(10).font('Helvetica').text(document.alamat_sekolah, { align: 'center' });
                }
                doc.moveDown(0.5);
                // Horizontal line under header
                doc.moveTo(MARGIN_LEFT, doc.y).lineTo(595.28 - MARGIN_RIGHT, doc.y).stroke();
                doc.moveDown();
            }

            // Document Type Header
            doc.fontSize(14).font('Helvetica-Bold').text(this.getDocumentTitle(type), { align: 'center' });
            doc.moveDown(0.5);

            // Document Title
            doc.fontSize(12).font('Helvetica-Bold').text(document.judul || 'Untitled', { align: 'center' });
            doc.moveDown();

            // Identitas Section (Times Roman for body)
            doc.fontSize(11).font('Times-Roman');
            if (document.mapel) doc.text(`Mata Pelajaran: ${document.mapel}`);
            if (document.kelas) doc.text(`Kelas: ${document.kelas}`);
            if (document.kurikulum) doc.text(`Kurikulum: ${document.kurikulum}`);
            if (document.alokasi_waktu) doc.text(`Alokasi Waktu: ${document.alokasi_waktu} menit`);
            doc.moveDown();

            // Main Content
            const content = document.konten_lengkap || document.konten || {};
            this.addContentToPDF(doc, content);

            // Add page numbers to all pages (footer)
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);

                // Footer with page number
                const pageText = `Halaman ${i + 1} dari ${range.count}`;
                doc.fontSize(9)
                    .font('Helvetica')
                    .fillColor('gray')
                    .text(
                        pageText,
                        MARGIN_LEFT,
                        841.89 - MARGIN_BOTTOM + 20, // Position in footer area
                        { align: 'center', width: 595.28 - MARGIN_LEFT - MARGIN_RIGHT }
                    );

                // Date on right side of footer
                doc.text(
                    `Dibuat: ${new Date().toLocaleDateString('id-ID')}`,
                    MARGIN_LEFT,
                    841.89 - MARGIN_BOTTOM + 20,
                    { align: 'right', width: 595.28 - MARGIN_LEFT - MARGIN_RIGHT }
                );
            }

            doc.end();
        });
    }

    /**
     * Add content sections to PDF
     */
    private addContentToPDF(doc: PDFKit.PDFDocument, content: any, level = 0): void {
        const PAGE_HEIGHT_THRESHOLD = 700; // Trigger new page if close to bottom

        if (typeof content === 'string') {
            doc.fontSize(10).font('Helvetica').fillColor('black').text(content, { align: 'justify' });
            doc.moveDown(0.5);
            return;
        }

        if (Array.isArray(content)) {
            content.forEach((item, index) => {
                if (doc.y > PAGE_HEIGHT_THRESHOLD) doc.addPage();
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
                // Force page break for major sections at root level
                if (level === 0 && doc.y > 150) { // If not at very top
                    doc.addPage();
                } else if (doc.y > PAGE_HEIGHT_THRESHOLD) {
                    doc.addPage();
                }

                const title = this.formatSectionTitle(key);
                doc.fontSize(level === 0 ? 14 : 11) // Larger font for main sections
                    .font('Helvetica-Bold')
                    .fillColor('black')
                    .text(title);

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
     * Ensure storage bucket exists
     */
    private async ensureBucketExists(): Promise<void> {
        const client = this.supabaseService.getAdminClient();

        // Check if bucket exists
        const { data: buckets, error: listError } = await client.storage.listBuckets();

        if (listError) {
            this.logger.warn('Failed to list buckets:', listError.message);
            return; // Continue anyway, bucket might exist
        }

        const bucketExists = buckets?.some(b => b.name === this.BUCKET_NAME);

        if (!bucketExists) {
            this.logger.log(`Creating bucket: ${this.BUCKET_NAME}`);
            const { error: createError } = await client.storage.createBucket(this.BUCKET_NAME, {
                public: false,
                fileSizeLimit: 52428800, // 50MB
            });

            if (createError && !createError.message.includes('already exists')) {
                this.logger.warn('Failed to create bucket:', createError.message);
            } else {
                this.logger.log(`Bucket ${this.BUCKET_NAME} ready`);
            }
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
        // Ensure bucket exists
        await this.ensureBucketExists();

        const path = `${userId}/${filename}`;
        const contentType = format === ExportFormat.PDF ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        const client = this.supabaseService.getAdminClient();

        // Try upload with upsert
        const { data, error } = await client
            .storage.from(this.BUCKET_NAME)
            .upload(path, buffer, {
                contentType,
                upsert: true,
            });

        if (error) {
            this.logger.error('Storage upload error:', error.message);

            // If bucket doesn't exist error, try creating and retry once
            if (error.message.includes('not found') || error.message.includes('does not exist')) {
                this.logger.log('Retrying with bucket creation...');

                await client.storage.createBucket(this.BUCKET_NAME, {
                    public: false,
                    fileSizeLimit: 52428800,
                });

                const { error: retryError } = await client
                    .storage.from(this.BUCKET_NAME)
                    .upload(path, buffer, { contentType, upsert: true });

                if (retryError) {
                    this.logger.error('Retry failed:', retryError.message);
                    throw new BadRequestException(`Gagal upload: ${retryError.message}. Pastikan bucket storage sudah dikonfigurasi di Supabase.`);
                }
            } else {
                throw new BadRequestException(`Gagal upload: ${error.message}. Cek konfigurasi Supabase Storage.`);
            }
        }

        // Get signed URL (valid for 1 hour)
        const { data: signedData, error: signedError } = await client
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
            [DocumentType.ASESMEN]: 'asesmen',
            [DocumentType.BANK_SOAL]: 'bank_soal',
            [DocumentType.MATERI]: 'materi',
            [DocumentType.RUBRIK]: 'rubrik',
            [DocumentType.ATP]: 'atp',
            [DocumentType.TUJUAN_PEMBELAJARAN]: 'tujuan_pembelajaran',
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
            [DocumentType.ASESMEN]: 'asesmen',
            [DocumentType.BANK_SOAL]: 'bank_soal',
            [DocumentType.MATERI]: 'materi',
            [DocumentType.RUBRIK]: 'rubrik',
            [DocumentType.ATP]: 'atp',
            [DocumentType.TUJUAN_PEMBELAJARAN]: 'tujuan_pembelajaran',
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
            [DocumentType.ASESMEN]: 'DOKUMEN ASESMEN',
            [DocumentType.BANK_SOAL]: 'BANK SOAL',
            [DocumentType.MATERI]: 'RINGKASAN MATERI',
            [DocumentType.RUBRIK]: 'RUBRIK PENILAIAN',
            [DocumentType.ATP]: 'ALUR TUJUAN PEMBELAJARAN (ATP)',
            [DocumentType.TUJUAN_PEMBELAJARAN]: 'TUJUAN PEMBELAJARAN (TP)',
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
