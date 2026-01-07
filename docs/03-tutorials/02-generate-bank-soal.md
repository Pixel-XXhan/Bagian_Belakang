# Tutorial: Generate Bank Soal dengan AI

Tutorial membuat soal otomatis menggunakan AI.

## 🎯 Objectives

- Generate multiple soal sekaligus
- Memahami tipe dan tingkat kesulitan
- Bulk create soal

## Step 1: Generate 5 Soal Pilihan Ganda

```bash
curl -X POST http://localhost:3001/api/v2/bank-soal/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mapel": "IPA",
    "topik": "Sistem Peredaran Darah",
    "kelas": "VIII SMP",
    "tipe": "pilihan_ganda",
    "tingkat_kesulitan": "sedang",
    "jumlah": 5
  }'
```

## Step 2: Analisis Response

```json
{
  "count": 5,
  "soal": [
    {
      "id": "uuid-1",
      "tipe": "pilihan_ganda",
      "tingkat_kesulitan": "sedang",
      "pertanyaan": "Bagian jantung yang memompa darah ke seluruh tubuh adalah...",
      "pilihan": [
        { "label": "A", "text": "Serambi kiri" },
        { "label": "B", "text": "Serambi kanan" },
        { "label": "C", "text": "Bilik kiri" },
        { "label": "D", "text": "Bilik kanan" }
      ],
      "jawaban_benar": "C",
      "pembahasan": "Bilik kiri memompa darah ke seluruh tubuh melalui aorta..."
    },
    // ... 4 soal lainnya
  ],
  "ai_response": {
    "model": "gemini-2.5-flash",
    "usage": { "promptTokens": 300, "completionTokens": 1500 }
  }
}
```

## Step 3: Generate Soal Essay

```bash
curl -X POST http://localhost:3001/api/v2/bank-soal/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mapel": "Bahasa Indonesia",
    "topik": "Teks Eksposisi",
    "kelas": "X SMA",
    "tipe": "essay",
    "tingkat_kesulitan": "sulit",
    "jumlah": 3
  }'
```

## Step 4: Lihat Statistik Bank Soal

```bash
curl -X GET http://localhost:3001/api/v2/bank-soal/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "total": 8,
  "by_tipe": {
    "pilihan_ganda": 5,
    "essay": 3
  },
  "by_tingkat": {
    "sedang": 5,
    "sulit": 3
  }
}
```

## Step 5: Filter dan Search Soal

```bash
# Filter by tipe
GET /api/v2/bank-soal?tipe=essay

# Filter by tingkat
GET /api/v2/bank-soal?tingkat_kesulitan=sulit

# Kombinasi filter
GET /api/v2/bank-soal?tipe=pilihan_ganda&tingkat_kesulitan=mudah&limit=10
```

## Tipe Soal yang Tersedia

| Tipe | Use Case |
|------|----------|
| `pilihan_ganda` | Evaluasi cepat, penilaian objektif |
| `essay` | Evaluasi pemahaman mendalam |
| `isian_singkat` | Recall informasi |
| `benar_salah` | Pemahaman konsep |
| `menjodohkan` | Hubungan antar konsep |

## Tingkat Kesulitan

| Level | Taksonomi Bloom | Contoh |
|-------|-----------------|--------|
| `mudah` | C1-C2 | Mengingat, Memahami |
| `sedang` | C3-C4 | Menerapkan, Menganalisis |
| `sulit` | C5-C6 | Mengevaluasi, Mencipta |

## Tips Menggunakan AI Generate

1. **Tentukan topik spesifik** - "Sistem Peredaran Darah" lebih baik dari "IPA"
2. **Variasikan tingkat** - Mix mudah/sedang/sulit untuk asesmen komprehensif
3. **Review pembahasan** - Pastikan akurasi pembahasan sebelum digunakan
4. **Edit jika perlu** - Gunakan PUT untuk edit soal yang kurang tepat

## Next Steps

- [Export ke PDF](./03-export-pdf.md)
- [Workflow Lengkap Guru](./04-teacher-workflow.md)
