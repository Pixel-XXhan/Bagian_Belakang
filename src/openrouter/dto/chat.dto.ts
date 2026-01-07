import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============== Model Support ==============
export const OPENROUTER_MODELS = [
    'anthropic/claude-opus-4.5',
    'anthropic/claude-sonnet-4.5',
    'openai/gpt-5.2-chat',
    'openai/gpt-5.2-pro',
    'openai/gpt-5.2',
] as const;

export type OpenRouterModel = typeof OPENROUTER_MODELS[number];

// ============== Content Parts (OpenAI Compatible) ==============
export class TextContentPart {
    @ApiProperty({ example: 'text' })
    @IsString()
    type: 'text';

    @ApiProperty({ example: 'Analisis gambar ini' })
    @IsString()
    text: string;
}

export class ImageContentPart {
    @ApiProperty({ example: 'image_url' })
    @IsString()
    type: 'image_url';

    @ApiProperty({
        description: 'Image URL atau base64 data',
        example: { url: 'https://example.com/image.png', detail: 'auto' }
    })
    @IsObject()
    image_url: {
        url: string;
        detail?: 'auto' | 'low' | 'high';
    };
}

export type ContentPart = TextContentPart | ImageContentPart;

// ============== Messages ==============
export class OpenRouterMessageDto {
    @ApiProperty({ enum: ['user', 'assistant', 'system', 'tool'], example: 'user' })
    @IsString()
    role: 'user' | 'assistant' | 'system' | 'tool';

    @ApiProperty({
        description: 'Text atau array of content parts (untuk vision)',
        example: 'Buatkan RPP untuk Fisika kelas 11'
    })
    @IsOptional()
    content?: string | ContentPart[];

    @ApiPropertyOptional({ description: 'Nama sender (opsional)' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Tool call ID (untuk tool response)' })
    @IsOptional()
    @IsString()
    tool_call_id?: string;
}

// ============== Function/Tool Calling ==============
export class FunctionDescriptionDto {
    @ApiProperty({ example: 'get_weather', description: 'Nama function' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'Get current weather for a location' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Parameter schema (JSON Schema)',
        example: { type: 'object', properties: { location: { type: 'string' } } }
    })
    @IsOptional()
    @IsObject()
    parameters?: Record<string, any>;
}

export class ToolDto {
    @ApiProperty({ example: 'function' })
    @IsString()
    type: 'function';

    @ApiProperty({ type: FunctionDescriptionDto })
    @ValidateNested()
    @Type(() => FunctionDescriptionDto)
    function: FunctionDescriptionDto;
}

export class ToolChoiceDto {
    @ApiProperty({ example: 'function' })
    @IsString()
    type: 'function';

    @ApiProperty({ example: { name: 'get_weather' } })
    @IsObject()
    function: {
        name: string;
    };
}

// ============== Main Chat Request ==============
export class OpenRouterChatDto {
    @ApiPropertyOptional({
        enum: OPENROUTER_MODELS,
        default: 'anthropic/claude-sonnet-4.5',
        description: 'Model yang digunakan'
    })
    @IsOptional()
    @IsString()
    model?: OpenRouterModel;

    @ApiProperty({
        type: [OpenRouterMessageDto],
        description: 'Array of messages (chat history)'
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OpenRouterMessageDto)
    messages: OpenRouterMessageDto[];

    @ApiPropertyOptional({ default: false, description: 'Enable streaming response' })
    @IsOptional()
    @IsBoolean()
    stream?: boolean;

    @ApiPropertyOptional({ minimum: 0, maximum: 2, default: 1, description: 'Temperature (0-2)' })
    @IsOptional()
    @IsNumber()
    temperature?: number;

    @ApiPropertyOptional({ description: 'Maximum output tokens' })
    @IsOptional()
    @IsNumber()
    max_tokens?: number;

    @ApiPropertyOptional({ minimum: 0, maximum: 1, description: 'Top P sampling (0-1)' })
    @IsOptional()
    @IsNumber()
    top_p?: number;

    @ApiPropertyOptional({ description: 'Top K sampling' })
    @IsOptional()
    @IsNumber()
    top_k?: number;

    @ApiPropertyOptional({ minimum: -2, maximum: 2, description: 'Frequency penalty (-2 to 2)' })
    @IsOptional()
    @IsNumber()
    frequency_penalty?: number;

    @ApiPropertyOptional({ minimum: -2, maximum: 2, description: 'Presence penalty (-2 to 2)' })
    @IsOptional()
    @IsNumber()
    presence_penalty?: number;

    @ApiPropertyOptional({ minimum: 0, maximum: 2, description: 'Repetition penalty (0-2)' })
    @IsOptional()
    @IsNumber()
    repetition_penalty?: number;

    @ApiPropertyOptional({ type: [ToolDto], description: 'Tools untuk function calling' })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ToolDto)
    tools?: ToolDto[];

    @ApiPropertyOptional({
        description: 'Tool selection mode',
        example: 'auto'
    })
    @IsOptional()
    tool_choice?: 'none' | 'auto' | 'required' | ToolChoiceDto;

    @ApiPropertyOptional({ default: true, description: 'Allow parallel tool calls' })
    @IsOptional()
    @IsBoolean()
    parallel_tool_calls?: boolean;

    @ApiPropertyOptional({
        description: 'Response format (JSON mode)',
        example: { type: 'json_object' }
    })
    @IsOptional()
    @IsObject()
    response_format?: { type: 'json_object' | 'text' };

    @ApiPropertyOptional({ description: 'Stop sequences' })
    @IsOptional()
    stop?: string | string[];

    @ApiPropertyOptional({ description: 'Seed for deterministic output' })
    @IsOptional()
    @IsNumber()
    seed?: number;
}

// ============== Response Types ==============
export interface OpenRouterToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}

export interface OpenRouterChoice {
    index: number;
    message?: {
        role: string;
        content: string | null;
        tool_calls?: OpenRouterToolCall[];
    };
    delta?: {
        role?: string;
        content?: string | null;
        tool_calls?: OpenRouterToolCall[];
    };
    finish_reason: string | null;
}

export interface OpenRouterUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

export interface OpenRouterChatResponse {
    id: string;
    model: string;
    object: 'chat.completion' | 'chat.completion.chunk';
    created: number;
    choices: OpenRouterChoice[];
    usage?: OpenRouterUsage;
}
