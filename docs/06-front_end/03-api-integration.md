# API Integration Guide

## 🔧 Base Configuration

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'API Error')
  }

  return response.json()
}
```

---

## 📖 CRUD Operations

### List (dengan Pagination & Filter)

```typescript
// GET /api/v2/rpp?limit=10&offset=0&mapel_id=uuid&search=aljabar
const data = await apiRequest('/api/v2/rpp?limit=10&offset=0')
```

### Get Single

```typescript
// GET /api/v2/rpp/:id
const rpp = await apiRequest(`/api/v2/rpp/${id}`)
```

### Create

```typescript
// POST /api/v2/rpp
const newRpp = await apiRequest('/api/v2/rpp', {
  method: 'POST',
  body: JSON.stringify({
    judul: 'RPP Matematika',
    kelas: 'X',
    mapel_id: 'uuid-mapel'
  })
})
```

### Update

```typescript
// PUT /api/v2/rpp/:id
const updated = await apiRequest(`/api/v2/rpp/${id}`, {
  method: 'PUT',
  body: JSON.stringify({ judul: 'Judul Baru' })
})
```

### Delete

```typescript
// DELETE /api/v2/rpp/:id
await apiRequest(`/api/v2/rpp/${id}`, { method: 'DELETE' })
```

---

## 🤖 AI Generation

### Non-Streaming

```typescript
// POST /api/v1/ai/chat
const response = await apiRequest('/api/v1/ai/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Buatkan RPP Matematika' }],
    systemInstruction: 'Kamu adalah ahli pendidikan',
    maxTokens: 65536,  // Maximum
    enableSearch: true  // Google Search ON
  })
})

console.log(response.content) // Hasil AI
```

### Streaming (SSE)

```typescript
// POST /api/v1/ai/chat/stream
const response = await fetch(`${API_BASE}/api/v1/ai/chat/stream`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Generate modul ajar' }]
  })
})

const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  
  const chunk = decoder.decode(value)
  const lines = chunk.split('\n')
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6)
      if (data === '[DONE]') break
      
      const parsed = JSON.parse(data)
      // Append to UI
      setContent(prev => prev + parsed.content)
    }
  }
}
```

---

## 📥 Export PDF/DOCX

```typescript
// POST /api/v2/export/pdf
const response = await fetch(`${API_BASE}/api/v2/export/pdf`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    type: 'rpp',
    id: 'uuid-rpp'
  })
})

// Response is file URL
const { url } = await response.json()
window.open(url, '_blank')
```

---

## 🔍 Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `limit` | number | Jumlah item (default: 10) |
| `offset` | number | Pagination offset |
| `search` | string | Search by judul/nama |
| `mapel_id` | uuid | Filter by mata pelajaran |
| `kelas` | string | Filter by kelas |
| `jenjang` | string | Filter by jenjang (SD/SMP/SMA) |

```typescript
// Contoh
const data = await apiRequest('/api/v2/modul-ajar?limit=20&search=aljabar&kelas=X')
```

---

## ⚠️ Error Response Format

```typescript
interface ApiError {
  success: false
  statusCode: number
  message: string
  error: string
  timestamp: string
  path: string
}

// Handle di catch block
try {
  await apiRequest('/api/v2/rpp', { ... })
} catch (error) {
  toast.error(error.message)
}
```
