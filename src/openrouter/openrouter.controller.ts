import { Controller, Post, Get, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OpenRouterService } from './openrouter.service';
import { OpenRouterChatDto } from './dto/chat.dto';

@ApiTags('OpenRouter')
@Controller('api/v1/openrouter')
export class OpenRouterController {
    constructor(private openRouterService: OpenRouterService) { }

    @Get('models')
    @ApiOperation({
        summary: 'List OpenRouter models',
        description: 'Mendapatkan daftar model yang tersedia via OpenRouter (Claude, GPT, dll)'
    })
    @ApiResponse({
        status: 200,
        description: 'Daftar model berhasil didapatkan',
        schema: {
            example: {
                models: [
                    { id: 'anthropic/claude-sonnet-4.5', name: 'anthropic/claude-sonnet-4.5', description: 'Model agentic dengan 1M context window' }
                ]
            }
        }
    })
    getModels() {
        return {
            models: this.openRouterService.getAvailableModels(),
        };
    }

    @Post('chat')
    @ApiOperation({
        summary: 'Chat completion',
        description: 'Generate response dari model via OpenRouter dengan support vision dan tool calling'
    })
    @ApiBody({
        type: OpenRouterChatDto,
        examples: {
            simple: {
                summary: 'Simple text chat',
                value: {
                    model: 'anthropic/claude-sonnet-4.5',
                    messages: [
                        { role: 'system', content: 'Kamu adalah asisten guru profesional' },
                        { role: 'user', content: 'Buatkan RPP untuk Fisika kelas 11' }
                    ],
                    temperature: 0.7
                }
            },
            withVision: {
                summary: 'Chat with image (vision)',
                value: {
                    model: 'anthropic/claude-sonnet-4.5',
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: 'Jelaskan diagram ini' },
                                { type: 'image_url', image_url: { url: 'data:image/png;base64,...' } }
                            ]
                        }
                    ]
                }
            },
            withTools: {
                summary: 'Chat with tool calling',
                value: {
                    model: 'openai/gpt-5.2-chat',
                    messages: [
                        { role: 'user', content: 'Cari informasi cuaca hari ini' }
                    ],
                    tools: [
                        {
                            type: 'function',
                            function: {
                                name: 'get_weather',
                                description: 'Get current weather',
                                parameters: {
                                    type: 'object',
                                    properties: {
                                        location: { type: 'string' }
                                    }
                                }
                            }
                        }
                    ],
                    tool_choice: 'auto'
                }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Response berhasil digenerate' })
    @ApiResponse({ status: 400, description: 'Request tidak valid' })
    async chat(@Body() dto: OpenRouterChatDto) {
        if (dto.stream) {
            return {
                error: 'Untuk streaming, gunakan endpoint /api/v1/openrouter/chat/stream',
            };
        }

        const response = await this.openRouterService.chat(dto);
        return response;
    }

    @Post('chat/stream')
    @ApiOperation({
        summary: 'Streaming chat completion',
        description: 'Generate response sebagai Server-Sent Events (SSE) stream. Compatible dengan Vercel AI SDK.'
    })
    @ApiBody({ type: OpenRouterChatDto })
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
    async chatStream(@Body() dto: OpenRouterChatDto, @Res() res: any) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        try {
            const stream = this.openRouterService.chatStream(dto);

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
