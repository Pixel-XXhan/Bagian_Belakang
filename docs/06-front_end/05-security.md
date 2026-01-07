# Security Best Practices

## 🔐 Authentication

### Token Storage

```typescript
// ✅ BENAR: Biarkan Supabase handle cookies
// Token disimpan sebagai HttpOnly cookie secara otomatis

// ❌ SALAH: Jangan simpan token di localStorage
localStorage.setItem('token', token) // JANGAN!
```

### Check Session

```typescript
// Selalu check session sebelum API call
const { data: { session } } = await supabase.auth.getSession()

if (!session) {
  router.push('/login')
  return
}
```

---

## 🛡️ API Security

### HTTPS Only (Production)
```
Production: https://api.katedra.id
```

### Rate Limiting

Backend sudah implement rate limiting:
- Short: 3 requests/second
- Medium: 20 requests/10 seconds
- Long: 100 requests/minute

**Handle di frontend:**
```typescript
if (response.status === 429) {
  toast.error('Terlalu banyak request. Coba lagi nanti.')
}
```

---

## 🚫 Jangan Expose Secrets

```env
# .env.local (HANYA NEXT_PUBLIC_ yang boleh di-expose)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Anon key boleh public
NEXT_PUBLIC_API_URL=http://localhost:3001

# JANGAN DI FRONTEND!
# SUPABASE_SERVICE_KEY=xxx (RAHASIA!)
# GEMINI_API_KEY=xxx (RAHASIA!)
```

---

## ✅ Input Validation

Backend sudah validasi semua input, tapi frontend juga harus:

```typescript
// Validasi sebelum kirim
if (!judul || judul.length < 3) {
  toast.error('Judul minimal 3 karakter')
  return
}

// Sanitize HTML jika diperlukan
import DOMPurify from 'dompurify'
const cleanContent = DOMPurify.sanitize(userInput)
```

---

## 🔒 XSS Prevention

```typescript
// Jangan render raw HTML dari user/AI
// ✅ BENAR
<div>{content}</div>

// ⚠️ HATI-HATI: Pastikan sudah sanitize
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

---

## 🛑 Error Messages

```typescript
// Jangan expose error detail ke user
// ❌ SALAH
toast.error(error.stack)

// ✅ BENAR
toast.error('Terjadi kesalahan. Silakan coba lagi.')
console.error(error) // Log untuk debugging
```

---

## 🔐 Protected API Endpoints

Semua endpoint `/api/v2/*` memerlukan authentication.

Endpoint public:
- `GET /api/health`
- `GET /api/v1/ai/models`
- `POST /api/v1/auth/*`
