import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import { GetSuggestionsDto, RelatedDocumentsDto, TopicSuggestionsDto } from './dto/suggestions.dto';

@Injectable()
export class SuggestionsService {
    private readonly logger = new Logger(SuggestionsService.name);

    constructor(
        private supabaseService: SupabaseService,
        private geminiService: GeminiService,
    ) { }

    async getTopicSuggestions(dto: TopicSuggestionsDto) {
        const systemInstruction = `Kamu adalah ahli kurikulum Indonesia.
Berikan saran topik pembelajaran yang sesuai dengan mata pelajaran dan kelas yang diberikan.
Topik harus sesuai dengan Kurikulum Merdeka.

Format output JSON:
{
  "mapel": "...",
  "kelas": "...",
  "semester": 1,
  "topik_saran": [
    {
      "topik": "...",
      "sub_topik": ["...", "..."],
      "estimasi_pertemuan": 2,
      "prioritas": "tinggi|sedang|rendah"
    }
  ]
}`;

        const prompt = `Berikan saran topik pembelajaran untuk:
- Mata Pelajaran: ${dto.mapel}
- Kelas: ${dto.kelas}
- Semester: ${dto.semester || 1}

Berikan 5-10 topik yang relevan.`;

        const response = await this.geminiService.chat({
            model: (dto.model || 'gemini-2.5-flash') as 'gemini-2.5-flash',
            messages: [{ role: 'user', content: prompt }],
            systemInstruction,
            responseFormat: { type: 'json_object' },
        });

        let result: Record<string, any> = {};
        try {
            result = JSON.parse(response.content);
        } catch {
            result = { raw_content: response.content };
        }

        return {
            ...result,
            ai_response: { model: response.model, usage: response.usage },
        };
    }

    async getRelatedDocuments(userId: string, dto: RelatedDocumentsDto) {
        // Get the original document first
        const { data: originalDoc, error: docError } = await this.supabaseService
            .getClient()
            .from(dto.document_type)
            .select('*')
            .eq('id', dto.document_id)
            .eq('user_id', userId)
            .single();

        if (docError || !originalDoc) {
            throw new NotFoundException('Dokumen tidak ditemukan');
        }

        const limit = dto.limit || 5;
        const related: Record<string, any[]> = {};

        // Find related RPP if not already RPP
        if (dto.document_type !== 'rpp') {
            const { data: rppData } = await this.supabaseService
                .getClient()
                .from('rpp')
                .select('id, judul, kelas, created_at')
                .eq('user_id', userId)
                .limit(limit);
            if (rppData?.length) related.rpp = rppData;
        }

        // Find related Bank Soal
        if (dto.document_type !== 'bank_soal') {
            const { data: soalData } = await this.supabaseService
                .getClient()
                .from('bank_soal')
                .select('id, pertanyaan, tipe, tingkat_kesulitan')
                .eq('user_id', userId)
                .limit(limit);
            if (soalData?.length) related.bank_soal = soalData;
        }

        // Find related LKPD
        if (dto.document_type !== 'lkpd') {
            const { data: lkpdData } = await this.supabaseService
                .getClient()
                .from('lkpd')
                .select('id, judul, kelas, created_at')
                .eq('user_id', userId)
                .limit(limit);
            if (lkpdData?.length) related.lkpd = lkpdData;
        }

        return {
            original_document: {
                id: originalDoc.id,
                type: dto.document_type,
                judul: originalDoc.judul || originalDoc.pertanyaan,
            },
            related_documents: related,
        };
    }

    async getSmartSuggestions(userId: string, dto: GetSuggestionsDto) {
        const suggestions: Record<string, any> = {
            mapel: dto.mapel,
            kelas: dto.kelas,
            topik: dto.topik,
        };

        // Get user's recent documents
        const { data: recentRpp } = await this.supabaseService
            .getClient()
            .from('rpp')
            .select('judul, materi_pokok, kelas')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);

        suggestions.recent_activity = recentRpp || [];

        // Get available templates
        const { data: templates } = await this.supabaseService
            .getClient()
            .from('template')
            .select('id, nama, kategori, mapel')
            .or(`is_public.eq.true,is_system.eq.true`)
            .limit(10);

        suggestions.recommended_templates = templates || [];

        // Get topic suggestions using AI
        if (dto.mapel && dto.kelas) {
            const topicSuggestions = await this.getTopicSuggestions({
                mapel: dto.mapel,
                kelas: dto.kelas,
            });
            suggestions.topic_suggestions = (topicSuggestions as any).topik_saran || [];
        }

        // Quick action suggestions
        suggestions.quick_actions = [
            { action: 'generate_rpp', label: 'Buat RPP Baru', icon: 'document' },
            { action: 'generate_soal', label: 'Generate Bank Soal', icon: 'quiz' },
            { action: 'generate_lkpd', label: 'Buat LKPD', icon: 'worksheet' },
            { action: 'browse_templates', label: 'Lihat Template', icon: 'template' },
        ];

        return suggestions;
    }

    async getNextSteps(userId: string, documentType: string, documentId: string) {
        const steps: Array<{ action: string; label: string }> = [];

        switch (documentType) {
            case 'rpp':
                steps.push(
                    { action: 'generate_lkpd', label: 'Buat LKPD untuk RPP ini' },
                    { action: 'generate_soal', label: 'Generate Bank Soal' },
                    { action: 'export_pdf', label: 'Export ke PDF' },
                    { action: 'share', label: 'Bagikan ke rekan' },
                );
                break;
            case 'silabus':
                steps.push(
                    { action: 'generate_rpp', label: 'Buat RPP dari Silabus' },
                    { action: 'generate_atp', label: 'Generate ATP' },
                    { action: 'export_docx', label: 'Export ke DOCX' },
                );
                break;
            case 'bank_soal':
                steps.push(
                    { action: 'generate_more', label: 'Generate soal lagi' },
                    { action: 'create_kisi_kisi', label: 'Buat Kisi-Kisi' },
                    { action: 'export_pdf', label: 'Export ke PDF' },
                );
                break;
            default:
                steps.push(
                    { action: 'export_pdf', label: 'Export ke PDF' },
                    { action: 'share', label: 'Bagikan' },
                );
        }

        return {
            document_type: documentType,
            document_id: documentId,
            next_steps: steps,
        };
    }
}
