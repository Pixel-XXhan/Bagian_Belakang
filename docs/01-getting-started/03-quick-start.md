# Quick Start Guide

Panduan cepat untuk mulai menggunakan RPP Generator API.

## 🚀 5 Menit Pertama

### 1. Jalankan Server

```bash
npm run start:dev
```

### 2. Buka Swagger UI

Akses `http://localhost:3001/api/docs`

### 3. Autentikasi

#### Register User Baru
```bash
curl -X POST http://localhost:3001/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "guru@sekolah.id",
    "password": "password123",
    "name": "Pak Guru"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3001/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "guru@sekolah.id",
    "password": "password123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbG...",
  "user": { "id": "...", "email": "..." }
}
```

### 4. Generate RPP Pertama

```bash
curl -X POST http://localhost:3001/api/v2/rpp/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mapel": "Matematika",
    "topik": "Pengukuran Sudut",
    "kelas": "X SMA",
    "alokasi_waktu": 90
  }'
```

### 5. Export ke PDF

```bash
curl -X POST http://localhost:3001/api/v2/export/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mapel": "Matematika",
    "topik": "Pengukuran Sudut",
    "kelas": "X SMA",
    "document_type": "rpp",
    "format": "pdf"
  }'
```

Response:
```json
{
  "download_url": "https://xxx.supabase.co/storage/v1/object/sign/...",
  "filename": "rpp_Pengukuran_Sudut.pdf",
  "format": "pdf",
  "expires_at": "2026-01-07T12:00:00Z"
}
```

## 📝 Use Case Umum

### Generate Silabus
```bash
POST /api/v2/silabus/generate
{
  "mapel": "Bahasa Indonesia",
  "kelas": "VII SMP",
  "semester": 1
}
```

### Generate Bank Soal (5 Soal)
```bash
POST /api/v2/bank-soal/generate
{
  "mapel": "IPA",
  "topik": "Sistem Peredaran Darah",
  "kelas": "VIII SMP",
  "tipe": "pilihan_ganda",
  "jumlah": 5
}
```

### Generate LKPD
```bash
POST /api/v2/lkpd/generate
{
  "mapel": "Fisika",
  "topik": "Hukum Newton",
  "kelas": "X SMA",
  "jenis_kegiatan": "kelompok"
}
```

### Lookup Capaian Pembelajaran
```bash
POST /api/v2/cp/lookup
{
  "mapel": "Matematika",
  "fase": "E"
}
```

## 🔄 Streaming Response

Untuk streaming AI generation:

```javascript
const response = await fetch('/api/v2/rpp/generate/stream', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ mapel: 'Matematika', topik: 'Aljabar', kelas: 'X' })
});

const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(new TextDecoder().decode(value));
}
```

## 📊 Cek Statistik

```bash
# Bank Soal Statistics
GET /api/v2/bank-soal/statistics

# Media Statistics
GET /api/v2/media/statistics
```

## Next Steps

- 📖 [API Reference](../02-api-reference/README.md) - Semua endpoints
- 🎓 [Tutorials](../03-tutorials/README.md) - Panduan mendalam
- 🏗️ [Architecture](../04-architecture/README.md) - Arsitektur sistem
