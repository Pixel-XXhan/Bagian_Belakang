# Export API

Export dokumen ke PDF dan DOCX, upload ke Supabase Storage.

## Base URL
```
/api/v2/export
```

## Format yang Didukung

| Format | MIME Type |
|--------|-----------|
| `pdf` | application/pdf |
| `docx` | application/vnd.openxmlformats-officedocument.wordprocessingml.document |

## Tipe Dokumen

| Value | Description |
|-------|-------------|
| `rpp` | Rencana Pelaksanaan Pembelajaran |
| `silabus` | Silabus |
| `modul_ajar` | Modul Ajar |
| `lkpd` | Lembar Kerja Peserta Didik |
| `kisi_kisi` | Kisi-Kisi Soal |

## Endpoints

### Export Dokumen yang Sudah Ada

Export dokumen dari database ke PDF/DOCX.

```http
POST /api/v2/export/document
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "document_id": "uuid-of-existing-document",
  "document_type": "rpp",
  "format": "pdf"
}
```

**Response (201):**
```json
{
  "download_url": "https://xxx.supabase.co/storage/v1/object/sign/exports/user-id/rpp_Pengukuran_Sudut_1736161234567.pdf?token=...",
  "filename": "rpp_Pengukuran_Sudut_1736161234567.pdf",
  "format": "pdf",
  "size": 45678,
  "expires_at": "2026-01-06T19:00:00Z"
}
```

---

### Generate dan Export (All-in-One) 🚀

Generate dokumen dengan AI, langsung export ke PDF/DOCX.

```http
POST /api/v2/export/generate
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "mapel": "Matematika",
  "topik": "Pengukuran Sudut",
  "kelas": "X SMA",
  "document_type": "rpp",
  "format": "pdf",
  "kurikulum": "Kurikulum Merdeka",
  "alokasi_waktu": 90,
  "model": "gemini-2.5-flash"
}
```

**Response (201):**
```json
{
  "download_url": "https://xxx.supabase.co/storage/v1/object/sign/...",
  "filename": "rpp_Pengukuran_Sudut_1736161234567.pdf",
  "format": "pdf",
  "size": 52340,
  "expires_at": "2026-01-06T19:00:00Z"
}
```

## Flow Diagram

```
┌─────────────────┐
│  API Request    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Generate with  │
│   Gemini AI     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Convert to     │
│   PDF/DOCX      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Upload to      │
│  Supabase       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Return Signed  │
│   Download URL  │
└─────────────────┘
```

## Download URL

- URL adalah **signed URL** dengan expiry time
- Default expiry: **1 jam** setelah generate
- Setelah expire, generate ulang untuk mendapat URL baru
- File tetap tersimpan di storage

## Usage Example (Frontend)

```javascript
// Generate dan download PDF
const response = await fetch('/api/v2/export/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    mapel: 'Matematika',
    topik: 'Aljabar',
    kelas: 'X',
    document_type: 'rpp',
    format: 'pdf'
  })
});

const { download_url } = await response.json();

// Trigger download
window.open(download_url, '_blank');
```

## Error Handling

| Code | Description |
|------|-------------|
| 400 | Invalid format or document_type |
| 404 | Document not found |
| 500 | PDF/DOCX generation failed |
| 503 | Supabase storage unavailable |
