import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsObject, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============== Providers & Models ==============
export enum AIProvider {
    GEMINI = 'gemini',
    OPENROUTER = 'openrouter',
}

export const GEMINI_MODELS = [
    'gemini-3-pro-preview',
    'gemini-3-flash-preview',
    'gemini-1.5-flash',
    'gemini-2.5-pro',
] as const;

export const OPENROUTER_MODELS = [
    'anthropic/claude-opus-4.5',
    'anthropic/claude-sonnet-4.5',
    'openai/gpt-5.2',
    'openai/gpt-5.2-pro',
    'openai/gpt-5.2-chat',
] as const;

export const ALL_MODELS = [...GEMINI_MODELS, ...OPENROUTER_MODELS] as const;

export type GeminiModel = typeof GEMINI_MODELS[number];
export type OpenRouterModel = typeof OPENROUTER_MODELS[number];
export type AllModels = typeof ALL_MODELS[number];

// ============== Message ==============
export class MessageDto {
    @ApiProperty({ enum: ['user', 'assistant', 'system'], example: 'user' })
    @IsString()
    role: 'user' | 'assistant' | 'system';

    @ApiProperty({ description: 'Message content' })
    content: string | any[];
}

// ============== Main Unified Chat Request ==============
export class UnifiedChatDto {
    @ApiPropertyOptional({
        description: 'AI Provider: gemini (default) atau openrouter',
        enum: AIProvider,
        default: AIProvider.GEMINI,
    })
    @IsOptional()
    @IsEnum(AIProvider)
    provider?: AIProvider;

    @ApiPropertyOptional({
        description: 'Model ID - Gemini: gemini-3-pro-preview, gemini-1.5-flash, etc. OpenRouter: anthropic/claude-opus-4.5, etc.',
        example: 'gemini-3-pro-preview',
    })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiProperty({ type: [MessageDto], description: 'Chat messages' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MessageDto)
    messages: MessageDto[];

    @ApiPropertyOptional({
        description: 'System instruction',
        example: 'Kamu adalah asisten guru profesional Indonesia',
    })
    @IsOptional()
    @IsString()
    systemInstruction?: string;

    @ApiPropertyOptional({
        description: 'Enable Google Search grounding (Gemini only) - DEFAULT: true',
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    enableSearch?: boolean;

    @ApiPropertyOptional({
        description: 'Temperature (0-2)',
        default: 0.7,
    })
    @IsOptional()
    @IsNumber()
    temperature?: number;

    @ApiPropertyOptional({
        description: 'Maximum output tokens - DEFAULT: 65536 (maximum)',
        default: 65536,
    })
    @IsOptional()
    @IsNumber()
    maxTokens?: number;

    @ApiPropertyOptional({ description: 'Top P sampling' })
    @IsOptional()
    @IsNumber()
    topP?: number;

    @ApiPropertyOptional({ description: 'Top K sampling' })
    @IsOptional()
    @IsNumber()
    topK?: number;

    @ApiPropertyOptional({ description: 'Enable streaming', default: false })
    @IsOptional()
    @IsBoolean()
    stream?: boolean;

    @ApiPropertyOptional({ description: 'Response format (json_object or text)' })
    @IsOptional()
    @IsObject()
    responseFormat?: { type: 'json_object' | 'text' };

    @ApiPropertyOptional({ description: 'Tools for function calling' })
    @IsOptional()
    @IsArray()
    tools?: any[];
}

// ============== Response ==============
export interface UnifiedChatResponse {
    id: string;
    provider: AIProvider;
    model: string;
    content: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    finishReason: string;
    groundingMetadata?: {
        searchQueries?: string[];
        searchResults?: any[];
    };
    functionCalls?: any[];
}

// ============== Models List Response ==============
export interface ModelInfo {
    id: string;
    provider: AIProvider;
    name: string;
    description: string;
    maxTokens: number;
    supportsSearch: boolean;
    supportsVision: boolean;
    recommended: boolean;
}
