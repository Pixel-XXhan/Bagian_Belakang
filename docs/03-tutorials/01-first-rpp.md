# Tutorial: Generate RPP Pertama

Tutorial step-by-step untuk generate RPP menggunakan AI.

## 🎯 Objectives

- Memahami flow generate RPP
- Mengirim request ke endpoint generate
- Memahami response structure

## Prerequisites

- ✅ Server running di `localhost:3001`
- ✅ Sudah login dan memiliki access token

## Step 1: Login untuk Mendapatkan Token

```bash
curl -X POST http://localhost:3001/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "guru@sekolah.id",
    "password": "password123"
  }'
```

Simpan `access_token` dari response.

## Step 2: Generate RPP dengan AI

```bash
curl -X POST http://localhost:3001/api/v2/rpp/generate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mapel": "Matematika",
    "topik": "Pengukuran Sudut",
    "kelas": "X SMA",
    "kurikulum": "Kurikulum Merdeka",
    "alokasi_waktu": 90
  }'
```

## Step 3: Analisis Response

Response akan berisi:

```json
{
  "id": "uuid-generated-rpp",
  "judul": "RPP Pengukuran Sudut",
  "kelas": "X SMA",
  "alokasi_waktu": 90,
  "konten_lengkap": {
    "identitas": {
      "satuan_pendidikan": "...",
      "mata_pelajaran": "Matematika",
      "kelas_semester": "X/1",
      "materi_pokok": "Pengukuran Sudut",
      "alokasi_waktu": "2 x 45 menit"
    },
    "tujuan_pembelajaran": [
      "Peserta didik dapat mengukur sudut...",
      "Peserta didik dapat menerapkan konsep..."
    ],
    "kegiatan_pembelajaran": {
      "pendahuluan": [...],
      "inti": [...],
      "penutup": [...]
    },
    "asesmen": {
      "formatif": {...},
      "sumatif": {...}
    },
    "sumber_belajar": [...]
  },
  "ai_response": {
    "model": "gemini-2.5-flash",
    "usage": {
      "promptTokens": 450,
      "completionTokens": 1850
    }
  }
}
```

## Step 4: Lihat RPP yang Tersimpan

```bash
curl -X GET http://localhost:3001/api/v2/rpp \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Step 5: Update Status RPP

```bash
curl -X PUT http://localhost:3001/api/v2/rpp/UUID_RPP \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "published"
  }'
```

## Tips & Best Practices

1. **Spesifik pada topik** - Semakin spesifik, semakin relevan hasil
2. **Sesuaikan alokasi waktu** - Pengaruhi kedalaman kegiatan
3. **Gunakan kurikulum yang benar** - "Kurikulum Merdeka" atau "Kurikulum 2013"
4. **Review dan edit** - Selalu review hasil AI sebelum digunakan

## Troubleshooting

### Error 401: Unauthorized
- Pastikan token masih valid
- Login ulang untuk mendapatkan token baru

### Error 500: AI Generation Failed
- Cek GEMINI_API_KEY valid
- Cek quota API Google AI Studio

## Next Steps

- [Generate Bank Soal](./02-generate-bank-soal.md)
- [Export ke PDF](./03-export-pdf.md)
