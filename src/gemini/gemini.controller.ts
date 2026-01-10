import { Controller, Post, Get, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GeminiService } from './gemini.service';
import { GeminiChatDto } from './dto/chat.dto';

@ApiTags('Gemini')
@Controller('api/v1/gemini')
export class GeminiController {
    constructor(private geminiService: GeminiService) { }

    @Get('models')
    @ApiOperation({
        summary: 'List Gemini models',
        description: 'Mendapatkan daftar model Gemini yang tersedia beserta deskripsinya'
    })
    @ApiResponse({
        status: 200,
        description: 'Daftar model berhasil didapatkan',
        schema: {
            example: {
                models: [
                    { id: 'gemini-1.5-flash', name: 'gemini-1.5-flash', description: 'Model cepat dan efisien' }
                ]
            }
        }
    })
    getModels() {
        return {
            models: this.geminiService.getAvailableModels(),
        };
    }

    @Post('chat')
    @ApiOperation({
        summary: 'Chat completion',
        description: 'Generate response dari Gemini model dengan support multimodal input dan function calling'
    })
    @ApiBody({
        type: GeminiChatDto,
        examples: {
            simple: {
                summary: 'Simple text chat',
                value: {
                    model: 'gemini-1.5-flash',
                    messages: [
                        { role: 'user', content: 'Buatkan RPP untuk Matematika kelas 10' }
                    ],
                    systemInstruction: 'Kamu adalah asisten guru profesional'
                }
            },
            withImage: {
                summary: 'Chat with image',
                value: {
                    model: 'gemini-1.5-flash',
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: 'Analisis gambar ini' },
                                { type: 'image', base64: 'base64_encoded_data', mimeType: 'image/png' }
                            ]
                        }
                    ]
                }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Response berhasil digenerate' })
    @ApiResponse({ status: 400, description: 'Request tidak valid' })
    async chat(@Body() dto: GeminiChatDto) {
        if (dto.stream) {
            return {
                error: 'Untuk streaming, gunakan endpoint /api/v1/gemini/chat/stream',
            };
        }

        const response = await this.geminiService.chat(dto);
        return response;
    }

    @Post('chat/stream')
    @ApiOperation({
        summary: 'Streaming chat completion',
        description: 'Generate response sebagai Server-Sent Events (SSE) stream. Response akan dikirim secara realtime chunk by chunk.'
    })
    @ApiBody({ type: GeminiChatDto })
    @ApiResponse({
        status: 200,
        description: 'SSE stream dimulai',
        content: {
            'text/event-stream': {
                schema: {
                    example: 'data: {"content":"Hello"}\n\ndata: {"content":" world"}\n\ndata: [DONE]\n\n'
                }
            }
        }
    })
    async chatStream(@Body() dto: GeminiChatDto, @Res() res: any) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        try {
            const stream = this.geminiService.chatStream(dto);

            for await (const chunk of stream) {
                const data = JSON.stringify({ content: chunk });
                res.write(`data: ${data}\n\n`);
            }

            res.write('data: [DONE]\n\n');
            res.end();
        } catch (error: any) {
            const errorData = JSON.stringify({
                error: error.message || 'Streaming error',
            });
            res.write(`data: ${errorData}\n\n`);
            res.end();
        }
    }
}
