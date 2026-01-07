# AI Integration

Dokumentasi integrasi AI services.

## Overview

RPP Generator menggunakan Google Gemini 2.5 sebagai AI provider utama untuk generate konten pembelajaran.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    NestJS Application                    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              GeminiModule (Global)               │    │
│  │  ┌─────────────────────────────────────────┐    │    │
│  │  │            GeminiService                 │    │    │
│  │  │  - chat()                                │    │    │
│  │  │  - chatStream()                          │    │    │
│  │  │  - generateContent()                     │    │    │
│  │  └──────────────────┬──────────────────────┘    │    │
│  └─────────────────────┼───────────────────────────┘    │
│                        │                                 │
└────────────────────────┼─────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Google AI Platform  │
              │     (Gemini API)     │
              └──────────────────────┘
```

## GeminiService API

### chat() - Single Response

```typescript
interface ChatRequest {
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  messages: { role: 'user' | 'assistant'; content: string }[];
  systemInstruction?: string;
  responseFormat?: { type: 'json_object' | 'text' };
}

interface ChatResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Usage
const response = await geminiService.chat({
  model: 'gemini-2.5-flash',
  messages: [{ role: 'user', content: 'Generate RPP...' }],
  systemInstruction: 'You are an Indonesian teacher...',
  responseFormat: { type: 'json_object' },
});
```

### chatStream() - Streaming Response

```typescript
async *chatStream(request: ChatRequest): AsyncGenerator<string> {
  // Yields content chunks
}

// Usage
for await (const chunk of geminiService.chatStream(request)) {
  process.stdout.write(chunk);
}
```

## Prompt Engineering

### System Instructions

Setiap modul memiliki system instruction khusus:

```typescript
// RPP Module
const rppSystemInstruction = `Kamu adalah guru profesional Indonesia...

Buatkan RPP lengkap sesuai format Kurikulum Merdeka:
1. Identitas RPP
2. Tujuan Pembelajaran
3. Kegiatan Pembelajaran (Pendahuluan, Inti, Penutup)
4. Asesmen
5. Sumber Belajar

Output dalam format JSON.`;
```

### Best Practices

1. **Spesifik dan Jelas**
   ```typescript
   // ❌ Bad
   systemInstruction: 'Buat soal'
   
   // ✅ Good
   systemInstruction: `Buat 5 soal pilihan ganda tentang fotosintesis
   untuk siswa SMP kelas 8, tingkat kesulitan sedang (C3-C4).
   Sertakan pembahasan untuk setiap soal.
   Output dalam format JSON.`
   ```

2. **Format Output yang Jelas**
   ```typescript
   // Selalu spesifikkan format output
   responseFormat: { type: 'json_object' }
   
   // Dan jelaskan struktur di system instruction:
   `Output dalam format JSON:
   {
     "judul": "...",
     "tujuan_pembelajaran": [...],
     "kegiatan": {...}
   }`
   ```

3. **Context Kurikulum Indonesia**
   ```typescript
   // Selalu sertakan context Indonesia
   systemInstruction: `Kamu adalah ahli kurikulum Indonesia...
   mengacu pada Kurikulum Merdeka...`
   ```

## Token Usage

### Estimasi Token per Request

| Document Type | Prompt Tokens | Completion Tokens |
|---------------|---------------|-------------------|
| RPP | ~500 | ~2000-3000 |
| Silabus | ~300 | ~1500-2000 |
| Bank Soal (5) | ~300 | ~1000-1500 |
| LKPD | ~400 | ~1500-2000 |

### Cost Estimation

Gemini 2.5 Flash pricing (per 1M tokens):
- Input: $0.075
- Output: $0.30

Estimated cost per RPP generation: ~$0.001-0.002

## Error Handling

```typescript
try {
  const response = await geminiService.chat(request);
} catch (error) {
  if (error.code === 'RESOURCE_EXHAUSTED') {
    // Rate limit exceeded
    throw new TooManyRequestsException('AI rate limit exceeded');
  }
  if (error.code === 'INVALID_ARGUMENT') {
    // Invalid prompt or parameters
    throw new BadRequestException('Invalid AI request');
  }
  // Generic error
  throw new InternalServerErrorException('AI generation failed');
}
```

## Fallback Strategy

```typescript
// Try Gemini first, fallback to OpenRouter if needed
async generateWithFallback(prompt: string) {
  try {
    return await this.geminiService.chat({ ... });
  } catch (error) {
    if (this.openRouterService) {
      return await this.openRouterService.chat({ ... });
    }
    throw error;
  }
}
```
