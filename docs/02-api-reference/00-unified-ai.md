# Unified AI API

Main endpoint untuk AI generation dengan dukungan provider switching.

## Base URL
```
/api/v1/ai
```

## Provider & Models

### Providers
| Provider | Key | Models |
|----------|-----|--------|
| **Gemini** (default) | `gemini` | gemini-3-pro-preview, gemini-3-flash-preview, gemini-2.5-flash, gemini-2.5-pro |
| **OpenRouter** | `openrouter` | anthropic/claude-opus-4.5, anthropic/claude-sonnet-4.5, openai/gpt-5.2, openai/gpt-5.2-pro |

### Recommended Models
- **Gemini**: `gemini-3-pro-preview` (flagship, terbaik untuk reasoning)
- **OpenRouter**: `anthropic/claude-opus-4.5` (visual reasoning superior)

---

## Endpoints

### List Available Models

```http
GET /api/v1/ai/models
```

**Response (200):**
```json
{
  "models": [
    {
      "id": "gemini-3-pro-preview",
      "provider": "gemini",
      "name": "gemini-3-pro-preview",
      "description": "Flagship model - Terbaik untuk reasoning kompleks",
      "maxTokens": 65536,
      "supportsSearch": true,
      "supportsVision": true,
      "recommended": true
    }
  ],
  "recommended": {
    "gemini": "gemini-3-pro-preview",
    "openrouter": "anthropic/claude-opus-4.5"
  },
  "defaults": {
    "maxTokens": 65536,
    "enableSearch": true,
    "temperature": 0.7
  }
}
```

---

### Chat Completion

```http
POST /api/v1/ai/chat
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Buatkan RPP Matematika kelas 10 materi Aljabar" }
  ],
  "systemInstruction": "Kamu adalah ahli pendidikan Indonesia",
  "model": "gemini-3-pro-preview",
  "enableSearch": true,
  "maxTokens": 65536,
  "temperature": 0.7
}
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `provider` | string | `gemini` | AI provider: gemini atau openrouter |
| `model` | string | `gemini-3-pro-preview` | Model ID |
| `messages` | array | required | Chat messages |
| `systemInstruction` | string | - | System prompt |
| `enableSearch` | boolean | `true` | Google Search grounding (Gemini only) |
| `maxTokens` | number | `65536` | Maximum output tokens |
| `temperature` | number | `0.7` | Creativity (0-2) |
| `topP` | number | - | Nucleus sampling |
| `topK` | number | - | Top-k sampling |
| `stream` | boolean | `false` | Enable streaming |
| `responseFormat` | object | - | `{ type: "json_object" }` for JSON mode |
| `tools` | array | - | Function calling tools |

### Auto Model Detection
- Model dimulai dengan `anthropic/` atau `openai/` → OpenRouter
- Lainnya → Gemini

**Response (200):**
```json
{
  "id": "unified-1704596400000",
  "provider": "gemini",
  "model": "gemini-3-pro-preview",
  "content": "# RPP Matematika\n\n## Identitas...",
  "usage": {
    "promptTokens": 150,
    "completionTokens": 2500,
    "totalTokens": 2650
  },
  "finishReason": "STOP",
  "groundingMetadata": {
    "searchQueries": ["kurikulum merdeka matematika"],
    "searchResults": [...]
  }
}
```

---

### Streaming Chat

```http
POST /api/v1/ai/chat/stream
Authorization: Bearer <token>
Content-Type: application/json
```

Returns Server-Sent Events (SSE).

---

## Examples

### Generate RPP dengan Gemini + Search

```json
{
  "messages": [
    { "role": "user", "content": "Buatkan RPP Matematika kelas 10 materi Aljabar lengkap dengan kegiatan pembelajaran" }
  ],
  "systemInstruction": "Kamu adalah ahli pendidikan Indonesia yang membantu guru membuat RPP sesuai Kurikulum Merdeka. Gunakan informasi terbaru dari internet.",
  "enableSearch": true,
  "maxTokens": 65536
}
```

### Generate dengan Claude Opus

```json
{
  "provider": "openrouter",
  "model": "anthropic/claude-opus-4.5",
  "messages": [
    { "role": "user", "content": "Analisis gambar soal ini dan buat pembahasan" }
  ],
  "maxTokens": 65536
}
```

### JSON Response Mode

```json
{
  "messages": [
    { "role": "user", "content": "Generate 5 soal pilihan ganda Matematika" }
  ],
  "responseFormat": { "type": "json_object" },
  "systemInstruction": "Output harus dalam format JSON: { soal: [...] }"
}
```

---

## Features

### ✅ Google Search Grounding (Default ON)
Gemini secara otomatis mencari informasi terbaru dari internet untuk menghasilkan konten yang akurat dan up-to-date.

### ✅ Maximum Token Output (65536)
Default output token diset maksimal untuk hasil yang komprehensif.

### ✅ Provider Switching
Switch antara Gemini dan OpenRouter dengan mudah tanpa mengubah kode frontend.

### ✅ Vision Support
- Gemini: Semua model support gambar
- OpenRouter: Claude dan GPT-5 support gambar
