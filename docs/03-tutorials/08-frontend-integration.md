# Tutorial: Frontend Integration

Panduan integrasi RPP Generator API dengan frontend.

## 🎯 Objectives

- Setup API client
- Implementasi auth
- Handle streaming response
- Error handling

## Setup API Client (JavaScript/TypeScript)

### Base Configuration

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('access_token');
    }
    return this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw await this.handleError(response);
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw await this.handleError(response);
    return response.json();
  }

  private async handleError(response: Response) {
    const error = await response.json();
    return new Error(error.message || 'API Error');
  }
}

export const api = new ApiClient();
```

## Authentication

```typescript
// hooks/useAuth.ts
import { api } from '@/lib/api';

export function useAuth() {
  const login = async (email: string, password: string) => {
    const response = await api.post<{ access_token: string }>('/api/v2/auth/login', {
      email,
      password,
    });
    api.setToken(response.access_token);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  return { login, logout };
}
```

## RPP Generation dengan Loading State

```typescript
// hooks/useRPP.ts
import { useState } from 'react';
import { api } from '@/lib/api';

export function useRPP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRPP = async (data: {
    mapel: string;
    topik: string;
    kelas: string;
    alokasi_waktu?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.post('/api/v2/rpp/generate', data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateRPP, loading, error };
}
```

## Streaming Response

```typescript
// hooks/useStreamingGenerate.ts
import { useState, useCallback } from 'react';

export function useStreamingGenerate() {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const generateStream = useCallback(async (endpoint: string, data: any) => {
    setContent('');
    setIsStreaming(true);
    
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`http://localhost:3001${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            setIsStreaming(false);
            return;
          }
          try {
            const parsed = JSON.parse(data);
            setContent(prev => prev + parsed.content);
          } catch {}
        }
      }
    }
    
    setIsStreaming(false);
  }, []);

  return { content, isStreaming, generateStream };
}
```

## React Component Example

```tsx
// components/RPPGenerator.tsx
import { useState } from 'react';
import { useRPP } from '@/hooks/useRPP';

export function RPPGenerator() {
  const { generateRPP, loading, error } = useRPP();
  const [form, setForm] = useState({
    mapel: '',
    topik: '',
    kelas: 'X SMA',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await generateRPP(form);
      console.log('RPP Generated:', result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Mata Pelajaran"
        value={form.mapel}
        onChange={(e) => setForm({ ...form, mapel: e.target.value })}
      />
      <input
        placeholder="Topik"
        value={form.topik}
        onChange={(e) => setForm({ ...form, topik: e.target.value })}
      />
      <select
        value={form.kelas}
        onChange={(e) => setForm({ ...form, kelas: e.target.value })}
      >
        <option value="X SMA">X SMA</option>
        <option value="XI SMA">XI SMA</option>
        <option value="XII SMA">XII SMA</option>
      </select>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Generating...' : 'Generate RPP'}
      </button>
      
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

## Error Handling Best Practices

```typescript
// lib/errors.ts
export function handleApiError(error: any): string {
  if (error.statusCode === 401) {
    // Redirect to login
    window.location.href = '/login';
    return 'Session expired, please login again';
  }
  
  if (error.statusCode === 429) {
    return 'Too many requests, please wait a moment';
  }
  
  if (error.statusCode >= 500) {
    return 'Server error, please try again later';
  }
  
  return error.message || 'Something went wrong';
}
```

## Download Generated PDF

```typescript
async function downloadPDF(docType: string, docId: string) {
  const result = await api.post('/api/v2/export/document', {
    document_id: docId,
    document_type: docType,
    format: 'pdf',
  });
  
  // Open download URL in new tab
  window.open(result.download_url, '_blank');
}
```
