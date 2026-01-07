# ⚠️ Hal Penting yang HARUS Diperhatikan

## 1. 🚫 Halaman yang TIDAK Didukung

**HAPUS halaman ini dari frontend:**

| Route | Alasan |
|-------|--------|
| `/dashboard/kelas` | Tidak ada data siswa |
| `/dashboard/kelas/[id]` | Tidak ada tracking kelas |
| `/dashboard/calendar` | Tidak ada tabel events |
| `/dashboard/notifications` | Tidak ada notification service |
| `/dashboard/files` | Tidak ada file manager |
| `/dashboard/media/upload` | Storage hanya untuk export |
| `/dashboard/analytics` (bagian siswa) | Tidak ada data siswa |

---

## 2. 🔑 Token WAJIB di Setiap Request

```typescript
// SETIAP request ke /api/v2/* HARUS include token
headers: {
  'Authorization': `Bearer ${session.access_token}`
}
```

Tanpa ini = **401 Unauthorized**

---

## 3. 🤖 AI sudah Optimal by Default

Jangan override setting ini kecuali ada alasan khusus:

| Setting | Default | Keterangan |
|---------|---------|------------|
| `enableSearch` | `true` | Google Search aktif |
| `maxTokens` | `65536` | Maximum output |
| `model` | `gemini-3-pro-preview` | Best model |

---

## 4. 📝 Response Format Berbeda per Endpoint

```typescript
// List endpoint: Array langsung
GET /api/v2/rpp → [{ id, judul, ... }, ...]

// Single endpoint: Object langsung
GET /api/v2/rpp/:id → { id, judul, ... }

// Create/Update: Object dengan data baru
POST /api/v2/rpp → { id, judul, ... }

// Delete: Message
DELETE /api/v2/rpp/:id → { message: "RPP berhasil dihapus" }

// Error: Selalu object dengan success: false
→ { success: false, statusCode: 400, message: "..." }
```

---

## 5. 🔄 Streaming untuk AI Long Response

Untuk generate dokumen panjang, gunakan streaming:

```typescript
// Non-streaming: Tunggu semua selesai (lambat untuk dokumen panjang)
POST /api/v1/ai/chat

// Streaming: Real-time response (recommended untuk UX)
POST /api/v1/ai/chat/stream
```

---

## 6. 📤 Export hanya PDF dan DOCX

```typescript
// Tipe yang didukung
POST /api/v2/export/pdf
POST /api/v2/export/docx

// Bukan image, excel, atau format lain
```

---

## 7. 🎨 User Preferences

User bisa set:
- `theme`: 'light' | 'dark' | 'system'
- `language`: 'id' | 'en'
- `default_ai_model`: model AI default

```typescript
// Get preferences
GET /api/v2/user-profile/preferences

// Update
PUT /api/v2/user-profile/preferences
{ theme: 'dark', language: 'id' }
```

---

## 8. 🔍 Search & Filter Patterns

```typescript
// Pagination
?limit=10&offset=0

// Search by text
?search=matematika

// Filter by field
?mapel_id=uuid&kelas=X&jenjang=SMA

// Combine
?limit=10&offset=0&search=aljabar&kelas=X
```

---

## 9. ⏱️ Rate Limiting

Jika terkena rate limit (429):

```typescript
if (response.status === 429) {
  // Wait dan retry
  await new Promise(r => setTimeout(r, 1000))
  return retry()
}
```

---

## 10. 🏥 Health Check

Untuk monitoring:

```typescript
// Simple ping
GET /api/health/ping → { status: 'ok', timestamp: '...' }

// Full health (termasuk DB, AI, Storage)
GET /api/health → { status: 'healthy', services: { ... } }
```

---

## 📞 Quick Reference

| Need | Endpoint |
|------|----------|
| Login | Supabase Auth |
| List documents | `GET /api/v2/{module}` |
| Create document | `POST /api/v2/{module}` |
| AI Generate | `POST /api/v2/{module}/generate` |
| Unified AI Chat | `POST /api/v1/ai/chat` |
| Export PDF | `POST /api/v2/export/pdf` |
| User Profile | `GET/PUT /api/v2/user-profile` |
| Templates | `GET /api/v2/template` |

---

*Jika ada pertanyaan, lihat Swagger docs di `/api/docs`*
