import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    OpenRouterChatDto,
    OpenRouterChatResponse,
    OPENROUTER_MODELS,
} from './dto/chat.dto';

@Injectable()
export class OpenRouterService {
    private readonly logger = new Logger(OpenRouterService.name);
    private readonly baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
    private apiKey: string;
    private siteUrl: string;
    private siteName: string;

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY') || '';
        this.siteUrl = this.configService.get<string>('SITE_URL') || 'http://localhost:3001';
        this.siteName = this.configService.get<string>('SITE_NAME') || 'RPP Generator';

        if (!this.apiKey) {
            this.logger.warn('OPENROUTER_API_KEY tidak ditemukan di .env');
        } else {
            this.logger.log('OpenRouter Client berhasil diinisialisasi');
        }
    }

    /**
     * Mendapatkan daftar model yang tersedia
     */
    getAvailableModels() {
        return OPENROUTER_MODELS.map((model) => ({
            id: model,
            name: model,
            description: this.getModelDescription(model),
        }));
    }

    private getModelDescription(model: string): string {
        const descriptions: Record<string, string> = {
            'anthropic/claude-opus-4.5': 'Model flagship Anthropic dengan visual reasoning superior',
            'anthropic/claude-sonnet-4.5': 'Model agentic dengan 1M context window',
            'openai/gpt-5.2-chat': 'GPT-5.2 versi conversational',
            'openai/gpt-5.2-pro': 'GPT-5.2 high-throughput/capability',
            'openai/gpt-5.2': 'GPT-5.2 flagship base model',
        };
        return descriptions[model] || 'OpenRouter Model';
    }

    /**
     * Build request body
     */
    private buildRequestBody(dto: OpenRouterChatDto): Record<string, any> {
        const body: Record<string, any> = {
            model: dto.model || 'anthropic/claude-sonnet-4.5',
            messages: dto.messages,
            stream: dto.stream ?? false,
        };

        // Parameters
        if (dto.temperature !== undefined) body.temperature = dto.temperature;
        if (dto.max_tokens !== undefined) body.max_tokens = dto.max_tokens;
        if (dto.top_p !== undefined) body.top_p = dto.top_p;
        if (dto.top_k !== undefined) body.top_k = dto.top_k;
        if (dto.frequency_penalty !== undefined) body.frequency_penalty = dto.frequency_penalty;
        if (dto.presence_penalty !== undefined) body.presence_penalty = dto.presence_penalty;
        if (dto.repetition_penalty !== undefined) body.repetition_penalty = dto.repetition_penalty;

        // Tool calling
        if (dto.tools && dto.tools.length > 0) {
            body.tools = dto.tools;
        }
        if (dto.tool_choice !== undefined) body.tool_choice = dto.tool_choice;
        if (dto.parallel_tool_calls !== undefined) body.parallel_tool_calls = dto.parallel_tool_calls;

        // Response format
        if (dto.response_format) body.response_format = dto.response_format;

        // Stop sequences
        if (dto.stop) body.stop = dto.stop;

        // Seed
        if (dto.seed !== undefined) body.seed = dto.seed;

        return body;
    }

    /**
     * Main chat completion (non-streaming)
     */
    async chat(dto: OpenRouterChatDto): Promise<OpenRouterChatResponse> {
        const body = this.buildRequestBody({ ...dto, stream: false });

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': this.siteUrl,
                    'X-Title': this.siteName,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`OpenRouter API Error: ${response.status} - ${errorText}`);
                throw new Error(`OpenRouter API Error: ${response.status}`);
            }

            const data = await response.json();
            return data as OpenRouterChatResponse;
        } catch (error) {
            this.logger.error('Gagal memanggil OpenRouter API:', error);
            throw error;
        }
    }

    /**
     * Streaming chat completion
     */
    async *chatStream(dto: OpenRouterChatDto): AsyncGenerator<string> {
        const body = this.buildRequestBody({ ...dto, stream: true });

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': this.siteUrl,
                    'X-Title': this.siteName,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`OpenRouter Streaming Error: ${response.status} - ${errorText}`);
                throw new Error(`OpenRouter API Error: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Response body tidak tersedia untuk streaming');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmed = line.trim();

                    // Skip empty lines dan comments
                    if (!trimmed || trimmed.startsWith(':')) continue;

                    // Parse SSE data
                    if (trimmed.startsWith('data: ')) {
                        const data = trimmed.slice(6);

                        // Check for done signal
                        if (data === '[DONE]') {
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                yield content;
                            }
                        } catch (e) {
                            // Ignore parse errors for non-JSON data
                        }
                    }
                }
            }
        } catch (error) {
            this.logger.error('Streaming error:', error);
            throw error;
        }
    }
}
