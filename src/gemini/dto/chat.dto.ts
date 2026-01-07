import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============== Model Support ==============
export const GEMINI_MODELS = [
    'gemini-3-pro-preview',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
] as const;

export type GeminiModel = typeof GEMINI_MODELS[number];

// ============== Content Parts ==============
export class TextPart {
    @ApiProperty({ example: 'text' })
    @IsString()
    type: 'text';

    @ApiProperty({ example: 'Buatkan RPP untuk Matematika' })
    @IsString()
    text: string;
}

export class ImagePart {
    @ApiProperty({ example: 'image' })
    @IsString()
    type: 'image';

    @ApiPropertyOptional({ description: 'URL gambar' })
    @IsOptional()
    @IsString()
    url?: string;

    @ApiPropertyOptional({ description: 'Base64 encoded image' })
    @IsOptional()
    @IsString()
    base64?: string;

    @ApiPropertyOptional({ example: 'image/png', description: 'MIME type gambar' })
    @IsOptional()
    @IsString()
    mimeType?: string;
}

export class FilePart {
    @ApiProperty({ example: 'file' })
    @IsString()
    type: 'file';

    @ApiProperty({ description: 'File URI dari Gemini Files API' })
    @IsString()
    uri: string;

    @ApiProperty({ example: 'application/pdf' })
    @IsString()
    mimeType: string;
}

// ============== Messages ==============
export class MessageDto {
    @ApiProperty({ enum: ['user', 'model', 'system'], example: 'user' })
    @IsString()
    role: 'user' | 'model' | 'system';

    @ApiProperty({
        description: 'Text content atau array of content parts untuk multimodal',
        example: 'Buatkan RPP untuk Matematika kelas 10'
    })
    @IsOptional()
    content?: string | (TextPart | ImagePart | FilePart)[];
}

// ============== Thinking Config ==============
export class ThinkingConfigDto {
    @ApiPropertyOptional({ enum: ['minimal', 'low', 'medium', 'high'], description: 'Level thinking' })
    @IsOptional()
    @IsString()
    thinkingLevel?: 'minimal' | 'low' | 'medium' | 'high';

    @ApiPropertyOptional({ description: 'Token budget untuk thinking (0-24576)' })
    @IsOptional()
    @IsNumber()
    thinkingBudget?: number;

    @ApiPropertyOptional({ description: 'Include thoughts dalam response', default: false })
    @IsOptional()
    @IsBoolean()
    includeThoughts?: boolean;
}

// ============== Function Calling ==============
export class FunctionParameterDto {
    @ApiProperty({ example: 'object' })
    @IsString()
    type: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    properties?: Record<string, any>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    required?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;
}

export class FunctionDeclarationDto {
    @ApiProperty({ example: 'get_weather', description: 'Nama function' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Deskripsi function' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Parameter schema (JSON Schema format)' })
    @IsOptional()
    @ValidateNested()
    @Type(() => FunctionParameterDto)
    parameters?: FunctionParameterDto;
}

export class ToolDto {
    @ApiPropertyOptional({ type: [FunctionDeclarationDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FunctionDeclarationDto)
    functionDeclarations?: FunctionDeclarationDto[];

    @ApiPropertyOptional({ description: 'Enable Google Search grounding' })
    @IsOptional()
    @IsObject()
    googleSearch?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Enable code execution' })
    @IsOptional()
    @IsObject()
    codeExecution?: Record<string, any>;
}

// ============== Main Chat Request ==============
export class GeminiChatDto {
    @ApiPropertyOptional({
        enum: GEMINI_MODELS,
        default: 'gemini-2.5-flash',
        description: 'Model yang digunakan'
    })
    @IsOptional()
    @IsString()
    model?: GeminiModel;

    @ApiProperty({
        type: [MessageDto],
        description: 'Array of messages (chat history)'
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MessageDto)
    messages: MessageDto[];

    @ApiPropertyOptional({
        description: 'System instruction untuk model',
        example: 'Kamu adalah asisten guru profesional yang membantu membuat RPP'
    })
    @IsOptional()
    @IsString()
    systemInstruction?: string;

    @ApiPropertyOptional({ type: ThinkingConfigDto, description: 'Konfigurasi thinking mode' })
    @IsOptional()
    @ValidateNested()
    @Type(() => ThinkingConfigDto)
    thinkingConfig?: ThinkingConfigDto;

    @ApiPropertyOptional({ minimum: 0, maximum: 2, default: 1, description: 'Temperature (0-2)' })
    @IsOptional()
    @IsNumber()
    temperature?: number;

    @ApiPropertyOptional({ description: 'Maximum output tokens' })
    @IsOptional()
    @IsNumber()
    maxTokens?: number;

    @ApiPropertyOptional({ minimum: 0, maximum: 1, description: 'Top P sampling' })
    @IsOptional()
    @IsNumber()
    topP?: number;

    @ApiPropertyOptional({ description: 'Top K sampling' })
    @IsOptional()
    @IsNumber()
    topK?: number;

    @ApiPropertyOptional({ type: [ToolDto], description: 'Tools untuk function calling' })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ToolDto)
    tools?: ToolDto[];

    @ApiPropertyOptional({ enum: ['auto', 'none', 'any'], description: 'Tool selection mode' })
    @IsOptional()
    @IsString()
    toolChoice?: 'auto' | 'none' | 'any';

    @ApiPropertyOptional({ default: false, description: 'Enable streaming response' })
    @IsOptional()
    @IsBoolean()
    stream?: boolean;

    @ApiPropertyOptional({ description: 'Response format (JSON mode)' })
    @IsOptional()
    @IsObject()
    responseFormat?: { type: 'json_object' | 'text' };
}

// ============== Response Types ==============
export interface GeminiChatResponse {
    id: string;
    model: string;
    content: string;
    thoughts?: string;
    functionCalls?: {
        name: string;
        args: Record<string, any>;
    }[];
    usage: {
        promptTokens: number;
        completionTokens: number;
        thoughtsTokens?: number;
        totalTokens: number;
    };
    finishReason: string;
    groundingMetadata?: {
        webSearchQueries?: string[];
        searchResults?: any[];
    };
}
