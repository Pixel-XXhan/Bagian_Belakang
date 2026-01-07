import { Controller, Post, Get, Body, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UnifiedAiService } from './unified-ai.service';
import { UnifiedChatDto, AIProvider } from './dto/unified-chat.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('AI - Unified')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/ai')
export class UnifiedAiController {
    constructor(private readonly aiService: UnifiedAiService) { }

    @Get('models')
    @Public()
    @ApiOperation({
        summary: 'List semua AI models',
        description: 'Mendapatkan daftar semua model AI yang tersedia dari Gemini dan OpenRouter',
    })
    @ApiResponse({
        status: 200,
        description: 'List of available models',
        schema: {
            example: {
                models: [
                    {
                        id: 'gemini-3-pro-preview',
                        provider: 'gemini',
                        name: 'gemini-3-pro-preview',
                        description: 'Flagship model - Terbaik untuk reasoning kompleks',
                        maxTokens: 65536,
                        supportsSearch: true,
                        supportsVision: true,
                        recommended: true,
                    },
                ],
                recommended: {
                    gemini: 'gemini-3-pro-preview',
                    openrouter: 'anthropic/claude-opus-4.5',
                },
            },
        },
    })
    getModels() {
        const models = this.aiService.getAvailableModels();
        return {
            models,
            recommended: {
                gemini: 'gemini-3-pro-preview',
                openrouter: 'anthropic/claude-opus-4.5',
            },
            defaults: {
                maxTokens: 65536,
                enableSearch: true,
                temperature: 0.7,
            },
        };
    }

    @Post('chat')
    @ApiOperation({
        summary: 'Unified AI Chat',
        description: `
Chat dengan AI (Gemini atau OpenRouter). 
- **Default provider**: Gemini
- **Default model**: gemini-3-pro-preview
- **Google Search**: Enabled by default (Gemini only)
- **Max tokens**: 65536 (maximum output)

Model auto-detection:
- Model dimulai dengan 'anthropic/' atau 'openai/' → OpenRouter
- Lainnya → Gemini
    `,
    })
    @ApiBody({
        type: UnifiedChatDto,
        examples: {
            geminiDefault: {
                summary: 'Gemini dengan Search (Recommended)',
                value: {
                    messages: [{ role: 'user', content: 'Buatkan RPP Matematika kelas 10 materi Aljabar' }],
                    systemInstruction: 'Kamu adalah ahli pendidikan Indonesia yang membantu guru membuat RPP sesuai Kurikulum Merdeka.',
                },
            },
            geminiExplicit: {
                summary: 'Gemini dengan model spesifik',
                value: {
                    provider: 'gemini',
                    model: 'gemini-3-pro-preview',
                    messages: [{ role: 'user', content: 'Generate bank soal 10 soal pilihan ganda' }],
                    maxTokens: 65536,
                    enableSearch: true,
                },
            },
            claude: {
                summary: 'OpenRouter - Claude Opus',
                value: {
                    provider: 'openrouter',
                    model: 'anthropic/claude-opus-4.5',
                    messages: [{ role: 'user', content: 'Buatkan kisi-kisi soal PAS Matematika' }],
                    maxTokens: 65536,
                },
            },
            gpt: {
                summary: 'OpenRouter - GPT-5.2',
                value: {
                    model: 'openai/gpt-5.2',
                    messages: [{ role: 'user', content: 'Buat modul ajar Fisika' }],
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'AI response generated' })
    async chat(@Body() dto: UnifiedChatDto) {
        if (dto.stream) {
            return { error: 'Untuk streaming, gunakan endpoint /api/v1/ai/chat/stream' };
        }

        const response = await this.aiService.chat(dto);
        return response;
    }

    @Post('chat/stream')
    @ApiOperation({
        summary: 'Streaming AI Chat',
        description: 'Server-Sent Events (SSE) streaming untuk real-time response',
    })
    @ApiBody({ type: UnifiedChatDto })
    async chatStream(@Body() dto: UnifiedChatDto, @Res() res: any) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        try {
            const stream = this.aiService.chatStream(dto);

            for await (const chunk of stream) {
                res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            }

            res.write('data: [DONE]\n\n');
            res.end();
        } catch (error: any) {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
    }
}
