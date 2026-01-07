# Dokumentasi API v1

## Gemini API

### Endpoint: POST /api/v1/gemini/chat

#### Request Body
```typescript
{
  // Model (opsional, default: gemini-2.5-flash)
  model?: 'gemini-3-pro-preview' | 'gemini-3-flash-preview' | 'gemini-2.5-flash' | 'gemini-2.5-pro';

  // Messages (wajib)
  messages: {
    role: 'user' | 'model' | 'system';
    content: string | ContentPart[];
  }[];

  // System Instruction (opsional)
  systemInstruction?: string;

  // Thinking Config (opsional)
  thinkingConfig?: {
    thinkingLevel?: 'minimal' | 'low' | 'medium' | 'high';
    thinkingBudget?: number; // 0-24576
    includeThoughts?: boolean;
  };

  // Parameters (opsional)
  temperature?: number; // 0-2
  maxTokens?: number;
  topP?: number;
  topK?: number;

  // Tools (opsional)
  tools?: {
    functionDeclarations?: FunctionDeclaration[];
    googleSearch?: {};
    codeExecution?: {};
  }[];

  toolChoice?: 'auto' | 'none' | 'any';
  responseFormat?: { type: 'json_object' };
}
```

#### Content Parts (Multimodal)
```typescript
// Text
{ type: 'text', text: 'Your text here' }

// Image (base64)
{ type: 'image', base64: 'base64_encoded_data', mimeType: 'image/png' }

// Image (URL)
{ type: 'image', url: 'https://example.com/image.png' }

// File (dari Files API)
{ type: 'file', uri: 'files/abc123', mimeType: 'application/pdf' }
```

#### Response
```typescript
{
  id: string;
  model: string;
  content: string;
  thoughts?: string;
  functionCalls?: { name: string; args: object }[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    thoughtsTokens?: number;
    totalTokens: number;
  };
  finishReason: string;
  groundingMetadata?: object;
}
```

---

## OpenRouter API

### Endpoint: POST /api/v1/openrouter/chat

#### Request Body (OpenAI Compatible)
```typescript
{
  // Model (opsional, default: anthropic/claude-sonnet-4.5)
  model?: string;

  // Messages (wajib)
  messages: {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string | ContentPart[];
    name?: string;
    tool_call_id?: string;
  }[];

  // Parameters
  temperature?: number; // 0-2
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;

  // Tools
  tools?: {
    type: 'function';
    function: {
      name: string;
      description?: string;
      parameters?: object;
    };
  }[];

  tool_choice?: 'none' | 'auto' | 'required' | { type: 'function', function: { name: string } };
  parallel_tool_calls?: boolean;

  response_format?: { type: 'json_object' };
  stop?: string | string[];
  seed?: number;
}
```

#### Content Parts (Vision)
```typescript
// Text
{ type: 'text', text: 'Analyze this image' }

// Image (URL atau base64)
{
  type: 'image_url',
  image_url: {
    url: 'https://example.com/image.png', // atau data:image/png;base64,...
    detail?: 'auto' | 'low' | 'high'
  }
}
```

#### Response
```typescript
{
  id: string;
  model: string;
  object: 'chat.completion';
  created: number;
  choices: [{
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: ToolCall[];
    };
    finish_reason: string;
  }];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

---

## Streaming (SSE)

Untuk streaming, gunakan endpoint `/chat/stream`:
- `POST /api/v1/gemini/chat/stream`
- `POST /api/v1/openrouter/chat/stream`

Format response:
```
data: {"content":"Hello"}

data: {"content":" world"}

data: [DONE]
```
