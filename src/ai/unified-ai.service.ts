import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    UnifiedChatDto,
    UnifiedChatResponse,
    AIProvider,
    GEMINI_MODELS,
    OPENROUTER_MODELS,
    ModelInfo,
} from './dto/unified-chat.dto';

@Injectable()
export class UnifiedAiService {
    private geminiClient: GoogleGenerativeAI;
    private openRouterApiKey: string;
    private readonly logger = new Logger(UnifiedAiService.name);
    private readonly openRouterBaseUrl = 'https://openrouter.ai/api/v1/chat/completions';

    // Default settings for maximum performance
    private readonly DEFAULT_MAX_TOKENS = 65536;
    private readonly DEFAULT_TEMPERATURE = 0.7;
    private readonly DEFAULT_MODEL = 'gemini-3-pro-preview';

    constructor(private configService: ConfigService) {
        const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (geminiKey) {
            this.geminiClient = new GoogleGenerativeAI(geminiKey);
            this.logger.log('✅ Gemini AI initialized');
        }

        this.openRouterApiKey = this.configService.get<string>('OPENROUTER_API_KEY') || '';
        if (this.openRouterApiKey) {
            this.logger.log('✅ OpenRouter initialized');
        }
    }

    /**
     * Get all available models with metadata
     */
    getAvailableModels(): ModelInfo[] {
        const models: ModelInfo[] = [];

        // Gemini models
        const geminiDescriptions: Record<string, { desc: string; maxTokens: number; recommended: boolean }> = {
            'gemini-3-pro-preview': { desc: 'Flagship model - Terbaik untuk reasoning kompleks', maxTokens: 65536, recommended: true },
            'gemini-3-flash-preview': { desc: 'Fast model dengan thinking capability', maxTokens: 65536, recommended: false },
            'gemini-1.5-flash': { desc: 'Efficient model untuk tugas umum', maxTokens: 8192, recommended: true },
            'gemini-2.5-pro': { desc: 'Pro model dengan context window besar', maxTokens: 32768, recommended: false },
        };

        for (const model of GEMINI_MODELS) {
            const info = geminiDescriptions[model];
            models.push({
                id: model,
                provider: AIProvider.GEMINI,
                name: model,
                description: info?.desc || 'Gemini Model',
                maxTokens: info?.maxTokens || 8192,
                supportsSearch: true,
                supportsVision: true,
                recommended: info?.recommended || false,
            });
        }

        // OpenRouter models
        const openRouterDescriptions: Record<string, { desc: string; maxTokens: number; recommended: boolean }> = {
            'anthropic/claude-opus-4.5': { desc: 'Claude Opus - Visual reasoning superior', maxTokens: 200000, recommended: true },
            'anthropic/claude-sonnet-4.5': { desc: 'Claude Sonnet - 1M context window', maxTokens: 200000, recommended: false },
            'openai/gpt-5.2': { desc: 'GPT-5.2 Flagship model', maxTokens: 128000, recommended: false },
            'openai/gpt-5.2-pro': { desc: 'GPT-5.2 Pro - High throughput', maxTokens: 128000, recommended: false },
            'openai/gpt-5.2-chat': { desc: 'GPT-5.2 Chat - Conversational', maxTokens: 128000, recommended: false },
        };

        for (const model of OPENROUTER_MODELS) {
            const info = openRouterDescriptions[model];
            models.push({
                id: model,
                provider: AIProvider.OPENROUTER,
                name: model,
                description: info?.desc || 'OpenRouter Model',
                maxTokens: info?.maxTokens || 8192,
                supportsSearch: false,
                supportsVision: model.includes('claude') || model.includes('gpt-5'),
                recommended: info?.recommended || false,
            });
        }

        return models;
    }

    /**
     * Main unified chat - auto routes to correct provider
     */
    async chat(dto: UnifiedChatDto): Promise<UnifiedChatResponse> {
        const provider = this.detectProvider(dto);

        if (provider === AIProvider.OPENROUTER) {
            return this.chatOpenRouter(dto);
        }

        return this.chatGemini(dto);
    }

    /**
     * Streaming chat
     */
    async *chatStream(dto: UnifiedChatDto): AsyncGenerator<string> {
        const provider = this.detectProvider(dto);

        if (provider === AIProvider.OPENROUTER) {
            yield* this.streamOpenRouter(dto);
        } else {
            yield* this.streamGemini(dto);
        }
    }

    /**
     * Detect provider based on model or explicit provider
     */
    private detectProvider(dto: UnifiedChatDto): AIProvider {
        if (dto.provider) return dto.provider;

        const model = dto.model || this.DEFAULT_MODEL;

        if (model.includes('anthropic/') || model.includes('openai/')) {
            return AIProvider.OPENROUTER;
        }

        return AIProvider.GEMINI;
    }

    /**
     * Chat with Gemini - includes Google Search by default
     */
    private async chatGemini(dto: UnifiedChatDto): Promise<UnifiedChatResponse> {
        const model = dto.model || this.DEFAULT_MODEL;
        const maxTokens = dto.maxTokens || this.DEFAULT_MAX_TOKENS;
        const enableSearch = dto.enableSearch !== false; // Default: true

        // Build contents
        const contents = dto.messages.map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }],
        }));

        // Build model params with MAXIMUM performance
        const modelParams: any = {
            model,
            generationConfig: {
                maxOutputTokens: maxTokens,
                temperature: dto.temperature ?? this.DEFAULT_TEMPERATURE,
            },
        };

        if (dto.topP !== undefined) modelParams.generationConfig.topP = dto.topP;
        if (dto.topK !== undefined) modelParams.generationConfig.topK = dto.topK;
        if (dto.responseFormat?.type === 'json_object') {
            modelParams.generationConfig.responseMimeType = 'application/json';
        }

        // System instruction
        if (dto.systemInstruction) {
            modelParams.systemInstruction = dto.systemInstruction;
        }

        // Enable Google Search grounding by default!
        const tools: any[] = dto.tools || [];
        if (enableSearch) {
            tools.push({ googleSearch: {} });
        }
        if (tools.length > 0) {
            modelParams.tools = tools;
        }

        try {
            const genModel = this.geminiClient.getGenerativeModel(modelParams);
            const result = await genModel.generateContent({ contents });
            const response = result.response;

            const candidate = response.candidates?.[0];
            const content = candidate?.content;
            let textContent = '';
            const functionCalls: any[] = [];

            for (const part of content?.parts || []) {
                if (part.text) textContent += part.text;
                if ((part as any).functionCall) {
                    functionCalls.push((part as any).functionCall);
                }
            }

            const usageMetadata = (response.usageMetadata || {}) as any;

            return {
                id: `unified-${Date.now()}`,
                provider: AIProvider.GEMINI,
                model,
                content: textContent,
                usage: {
                    promptTokens: usageMetadata.promptTokenCount || 0,
                    completionTokens: usageMetadata.candidatesTokenCount || 0,
                    totalTokens: usageMetadata.totalTokenCount || 0,
                },
                finishReason: candidate?.finishReason || 'STOP',
                groundingMetadata: candidate?.groundingMetadata as any,
                functionCalls: functionCalls.length > 0 ? functionCalls : undefined,
            };
        } catch (error) {
            this.logger.error('Gemini chat error:', error);
            throw error;
        }
    }

    /**
     * Chat with OpenRouter (Claude/GPT)
     */
    private async chatOpenRouter(dto: UnifiedChatDto): Promise<UnifiedChatResponse> {
        const model = dto.model || 'anthropic/claude-sonnet-4.5';
        const maxTokens = dto.maxTokens || 65536;

        const messages = dto.messages.map((msg) => ({
            role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
            content: msg.content,
        }));

        // Add system message if provided
        if (dto.systemInstruction) {
            messages.unshift({ role: 'system', content: dto.systemInstruction });
        }

        const body: any = {
            model,
            messages,
            max_tokens: maxTokens,
            temperature: dto.temperature ?? this.DEFAULT_TEMPERATURE,
            stream: false,
        };

        if (dto.topP !== undefined) body.top_p = dto.topP;
        if (dto.tools) body.tools = dto.tools;
        if (dto.responseFormat) body.response_format = dto.responseFormat;

        try {
            const response = await fetch(this.openRouterBaseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.openRouterApiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:3001',
                    'X-Title': 'RPP Generator',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenRouter Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const choice = data.choices?.[0];

            return {
                id: data.id || `unified-${Date.now()}`,
                provider: AIProvider.OPENROUTER,
                model,
                content: choice?.message?.content || '',
                usage: {
                    promptTokens: data.usage?.prompt_tokens || 0,
                    completionTokens: data.usage?.completion_tokens || 0,
                    totalTokens: data.usage?.total_tokens || 0,
                },
                finishReason: choice?.finish_reason || 'stop',
                functionCalls: choice?.message?.tool_calls,
            };
        } catch (error) {
            this.logger.error('OpenRouter chat error:', error);
            throw error;
        }
    }

    /**
     * Stream Gemini response
     */
    private async *streamGemini(dto: UnifiedChatDto): AsyncGenerator<string> {
        const model = dto.model || this.DEFAULT_MODEL;
        const maxTokens = dto.maxTokens || this.DEFAULT_MAX_TOKENS;
        const enableSearch = dto.enableSearch !== false;

        const contents = dto.messages.map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }],
        }));

        const modelParams: any = {
            model,
            generationConfig: {
                maxOutputTokens: maxTokens,
                temperature: dto.temperature ?? this.DEFAULT_TEMPERATURE,
            },
        };

        if (dto.systemInstruction) {
            modelParams.systemInstruction = dto.systemInstruction;
        }

        const tools: any[] = dto.tools || [];
        if (enableSearch) {
            tools.push({ googleSearch: {} });
        }
        if (tools.length > 0) {
            modelParams.tools = tools;
        }

        try {
            const genModel = this.geminiClient.getGenerativeModel(modelParams);
            const result = await genModel.generateContentStream({ contents });

            for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) yield text;
            }
        } catch (error) {
            this.logger.error('Gemini stream error:', error);
            throw error;
        }
    }

    /**
     * Stream OpenRouter response
     */
    private async *streamOpenRouter(dto: UnifiedChatDto): AsyncGenerator<string> {
        const model = dto.model || 'anthropic/claude-sonnet-4.5';
        const maxTokens = dto.maxTokens || 65536;

        const messages = dto.messages.map((msg) => ({
            role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
            content: msg.content,
        }));

        if (dto.systemInstruction) {
            messages.unshift({ role: 'system', content: dto.systemInstruction });
        }

        const body = {
            model,
            messages,
            max_tokens: maxTokens,
            temperature: dto.temperature ?? this.DEFAULT_TEMPERATURE,
            stream: true,
        };

        try {
            const response = await fetch(this.openRouterBaseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.openRouterApiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:3001',
                    'X-Title': 'RPP Generator',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error(`OpenRouter Error: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') return;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) yield content;
                        } catch { /* ignore */ }
                    }
                }
            }
        } catch (error) {
            this.logger.error('OpenRouter stream error:', error);
            throw error;
        }
    }
}
