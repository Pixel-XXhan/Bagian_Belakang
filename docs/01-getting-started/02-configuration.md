# Configuration Guide

Panduan konfigurasi environment variables dan settings.

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | URL project Supabase | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Anon/public key Supabase | `eyJhbG...` |
| `GEMINI_API_KEY` | API key Google Gemini | `AIza...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_SERVICE_KEY` | Service role key (admin) | - |
| `PORT` | Port server | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | Secret untuk JWT | Auto dari Supabase |
| `OPENROUTER_API_KEY` | API key OpenRouter | - |

## Supabase Configuration

### Mendapatkan Credentials

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Buka **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY`

### Row Level Security (RLS)

Pastikan RLS sudah aktif untuk semua tabel:

```sql
-- Aktifkan RLS
ALTER TABLE rpp ENABLE ROW LEVEL SECURITY;

-- Contoh policy
CREATE POLICY "Users can view own RPP"
ON rpp FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

## Gemini AI Configuration

### Mendapatkan API Key

1. Buka [Google AI Studio](https://aistudio.google.com)
2. Klik **Get API Key**
3. Create API key
4. Copy ke `GEMINI_API_KEY`

### Model yang Tersedia

| Model | Use Case |
|-------|----------|
| `gemini-2.5-flash` | Default, fast response |
| `gemini-2.5-pro` | Complex generation |

## OpenRouter Configuration (Optional)

Untuk multi-model AI support:

1. Daftar di [OpenRouter](https://openrouter.ai)
2. Get API key
3. Set `OPENROUTER_API_KEY`

## CORS Configuration

Default CORS sudah dikonfigurasi di `main.ts`:

```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'https://your-frontend.com'],
  credentials: true,
});
```

## Rate Limiting

Untuk production, aktifkan rate limiting di `main.ts`:

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

ThrottlerModule.forRoot({
  ttl: 60,
  limit: 100,
});
```

## Logging Configuration

Development:
```env
LOG_LEVEL=debug
```

Production:
```env
LOG_LEVEL=error
```

## Next Steps

Lanjut ke [Quick Start](./03-quick-start.md) untuk mulai menggunakan API.
