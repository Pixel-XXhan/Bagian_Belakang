import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, Content, Part, GenerativeModel } from '@google/generative-ai';
import {
    GeminiChatDto,
    GeminiChatResponse,
    GEMINI_MODELS,
    MessageDto,
} from './dto/chat.dto';

@Injectable()
export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private readonly logger = new Logger(GeminiService.name);

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');

        if (!apiKey) {
            this.logger.error('GEMINI_API_KEY tidak ditemukan di .env');
            return;
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.logger.log('Gemini AI Client berhasil diinisialisasi');
    }

    /**
     * Mendapatkan daftar model yang tersedia
     */
    getAvailableModels() {
        return GEMINI_MODELS.map((model) => ({
            id: model,
            name: model,
            description: this.getModelDescription(model),
        }));
    }

    private getModelDescription(model: string): string {
        const descriptions: Record<string, string> = {
            'gemini-3-pro-preview': 'Model 3 Pro terbaru (Preview)',
            'gemini-3-flash-preview': 'Model 3 Flash terbaru (Preview)',
            'gemini-2.5-flash': 'Model 2.5 Flash yang sangat cepat',
            'gemini-2.5-pro': 'Model 2.5 Pro dengan kemampuan reasoning',
        };
        return descriptions[model] || 'Gemini Model';
    }

    /**
     * Main chat completion dengan semua fitur
     */
    async chat(dto: GeminiChatDto): Promise<GeminiChatResponse> {
        const modelName = dto.model || 'gemini-1.5-flash';

        // Build contents dari messages
        const contents = this.buildContents(dto.messages);

        // Build generation config
        const generationConfig: Record<string, any> = {};
        if (dto.temperature !== undefined) generationConfig.temperature = dto.temperature;
        if (dto.maxTokens !== undefined) generationConfig.maxOutputTokens = dto.maxTokens;
        if (dto.topP !== undefined) generationConfig.topP = dto.topP;
        if (dto.topK !== undefined) generationConfig.topK = dto.topK;

        // Response format (JSON mode)
        if (dto.responseFormat?.type === 'json_object') {
            generationConfig.responseMimeType = 'application/json';
        }

        // Build model params
        const modelParams: any = {
            model: modelName,
        };

        if (Object.keys(generationConfig).length > 0) {
            modelParams.generationConfig = generationConfig;
        }

        // System instruction
        if (dto.systemInstruction) {
            modelParams.systemInstruction = dto.systemInstruction;
        }

        // Tools (function calling)
        if (dto.tools && dto.tools.length > 0) {
            modelParams.tools = dto.tools;
        }

        try {
            const model = this.genAI.getGenerativeModel(modelParams);
            const result = await model.generateContent({ contents });
            const response = result.response;

            return this.parseResponse(response, modelName);
        } catch (error) {
            this.logger.error('Gagal generate content:', error);
            throw error;
        }
    }

    /**
     * Streaming chat completion
     */
    async *chatStream(dto: GeminiChatDto): AsyncGenerator<string> {
        const modelName = dto.model || 'gemini-1.5-flash';
        const contents = this.buildContents(dto.messages);

        const generationConfig: Record<string, any> = {};
        if (dto.temperature !== undefined) generationConfig.temperature = dto.temperature;
        if (dto.maxTokens !== undefined) generationConfig.maxOutputTokens = dto.maxTokens;

        const modelParams: any = { model: modelName };
        if (Object.keys(generationConfig).length > 0) {
            modelParams.generationConfig = generationConfig;
        }
        if (dto.systemInstruction) {
            modelParams.systemInstruction = dto.systemInstruction;
        }
        if (dto.tools) {
            modelParams.tools = dto.tools;
        }

        try {
            const model = this.genAI.getGenerativeModel(modelParams);
            const result = await model.generateContentStream({ contents });

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                if (chunkText) {
                    yield chunkText;
                }
            }
        } catch (error) {
            this.logger.error('Streaming error:', error);
            throw error;
        }
    }

    /**
     * Build contents array dari messages
     */
    private buildContents(messages: MessageDto[]): Content[] {
        return messages.map((msg) => {
            // Simple text content
            if (typeof msg.content === 'string') {
                return {
                    role: msg.role === 'model' ? 'model' : 'user',
                    parts: [{ text: msg.content }],
                };
            }

            // Multimodal content
            const parts: Part[] = [];

            for (const part of msg.content || []) {
                if (part.type === 'text') {
                    parts.push({ text: (part as any).text });
                } else if (part.type === 'image') {
                    const imgPart = part as any;
                    if (imgPart.base64) {
                        parts.push({
                            inlineData: {
                                mimeType: imgPart.mimeType || 'image/png',
                                data: imgPart.base64,
                            },
                        });
                    }
                } else if (part.type === 'file') {
                    const filePart = part as any;
                    parts.push({
                        fileData: {
                            fileUri: filePart.uri,
                            mimeType: filePart.mimeType,
                        },
                    });
                }
            }

            return {
                role: msg.role === 'model' ? 'model' : 'user',
                parts,
            };
        });
    }

    /**
     * Parse response ke format standar
     */
    private parseResponse(response: any, model: string): GeminiChatResponse {
        const candidate = response.candidates?.[0];
        const content = candidate?.content;

        let textContent = '';
        const functionCalls: any[] = [];

        for (const part of content?.parts || []) {
            if (part.text) {
                textContent += part.text;
            }
            if (part.functionCall) {
                functionCalls.push({
                    name: part.functionCall.name,
                    args: part.functionCall.args,
                });
            }
        }

        const usageMetadata = response.usageMetadata || {};

        return {
            id: `gemini-${Date.now()}`,
            model,
            content: textContent,
            thoughts: undefined,
            functionCalls: functionCalls.length > 0 ? functionCalls : undefined,
            usage: {
                promptTokens: usageMetadata.promptTokenCount || 0,
                completionTokens: usageMetadata.candidatesTokenCount || 0,
                thoughtsTokens: undefined,
                totalTokens: usageMetadata.totalTokenCount || 0,
            },
            finishReason: candidate?.finishReason || 'STOP',
            groundingMetadata: candidate?.groundingMetadata,
        };
    }
}
