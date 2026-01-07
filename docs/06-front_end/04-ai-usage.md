# Unified AI API Usage

## 🎯 Endpoint Utama

```
POST /api/v1/ai/chat          → Non-streaming
POST /api/v1/ai/chat/stream   → Streaming (SSE)
GET  /api/v1/ai/models        → List available models
```

---

## 🤖 Available Models

### Gemini (Default, Recommended)
| Model | Description |
|-------|-------------|
| `gemini-3-pro-preview` | ⭐ Flagship, best reasoning |
| `gemini-3-flash-preview` | Fast with thinking |
| `gemini-2.5-flash` | Efficient for general tasks |
| `gemini-2.5-pro` | Large context window |

### OpenRouter
| Model | Description |
|-------|-------------|
| `anthropic/claude-opus-4.5` | ⭐ Best visual reasoning |
| `anthropic/claude-sonnet-4.5` | 1M context window |
| `openai/gpt-5.2` | GPT flagship |
| `openai/gpt-5.2-pro` | High throughput |

---

## 📤 Request Format

```typescript
interface UnifiedChatRequest {
  // Required
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  
  // Optional - defaults shown
  provider?: 'gemini' | 'openrouter'  // default: gemini
  model?: string                       // default: gemini-3-pro-preview
  systemInstruction?: string
  enableSearch?: boolean               // default: true (Google Search ON)
  maxTokens?: number                   // default: 65536 (maximum)
  temperature?: number                 // default: 0.7
  stream?: boolean                     // default: false
  responseFormat?: { type: 'json_object' | 'text' }
}
```

---

## ✅ Default Settings (Optimal)

Backend sudah di-optimize dengan:

| Setting | Default Value |
|---------|---------------|
| `enableSearch` | `true` (Google Search aktif) |
| `maxTokens` | `65536` (maximum output) |
| `temperature` | `0.7` |
| `model` | `gemini-3-pro-preview` |

**Anda TIDAK perlu set ini kecuali ingin override.**

---

## 🔥 Simple Usage

```typescript
// Minimal - semua defaults optimal
const response = await fetch('/api/v1/ai/chat', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Buatkan RPP Matematika kelas 10' }]
  })
})

const data = await response.json()
console.log(data.content)  // Hasil lengkap dengan grounding dari Google
```

---

## 🔄 Switch Provider

```typescript
// Gemini (default)
{ messages: [...] }

// Claude
{
  model: 'anthropic/claude-opus-4.5',
  messages: [...]
}

// GPT
{
  model: 'openai/gpt-5.2',
  messages: [...]
}
```

**Auto-detection**: Model dengan `anthropic/` atau `openai/` prefix otomatis ke OpenRouter.

---

## 📊 Response Format

```typescript
interface UnifiedChatResponse {
  id: string
  provider: 'gemini' | 'openrouter'
  model: string
  content: string                    // ← Hasil AI
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason: string
  groundingMetadata?: {              // ← Hasil Google Search (Gemini only)
    searchQueries?: string[]
    searchResults?: any[]
  }
}
```

---

## 🎯 Use Cases

### Generate RPP
```typescript
{
  messages: [{ role: 'user', content: 'Buatkan RPP Matematika kelas X materi Aljabar' }],
  systemInstruction: 'Kamu adalah ahli kurikulum Indonesia. Buat RPP sesuai Kurikulum Merdeka.'
}
```

### Generate Bank Soal (JSON)
```typescript
{
  messages: [{ role: 'user', content: 'Generate 10 soal pilihan ganda Fisika' }],
  responseFormat: { type: 'json_object' },
  systemInstruction: 'Output JSON: { "soal": [{ "pertanyaan": "...", "pilihan": [...], "jawaban": "A" }] }'
}
```

### Disable Search (jika tidak perlu)
```typescript
{
  messages: [...],
  enableSearch: false  // Matikan Google Search
}
```
