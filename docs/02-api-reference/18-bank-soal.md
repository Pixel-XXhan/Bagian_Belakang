# Bank Soal API

Generate dan kelola bank soal dengan AI.

## Base URL
```
/api/v2/bank-soal
```

## Tipe Soal

| Value | Description |
|-------|-------------|
| `pilihan_ganda` | Soal pilihan ganda (A, B, C, D) |
| `essay` | Soal uraian/essay |
| `isian_singkat` | Soal isian singkat |
| `benar_salah` | Soal benar/salah |
| `menjodohkan` | Soal menjodohkan |

## Tingkat Kesulitan

| Value | Description |
|-------|-------------|
| `mudah` | Level C1-C2 (Mengingat, Memahami) |
| `sedang` | Level C3-C4 (Menerapkan, Menganalisis) |
| `sulit` | Level C5-C6 (Mengevaluasi, Mencipta) |

## Endpoints

### List Soal

```http
GET /api/v2/bank-soal
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| tipe | string | Filter by tipe soal |
| tingkat_kesulitan | string | Filter by tingkat |
| mapel_id | uuid | Filter by mapel |
| search | string | Cari di pertanyaan |
| limit | number | Limit results |
| offset | number | Pagination offset |

---

### Get Statistics

```http
GET /api/v2/bank-soal/statistics
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "total": 150,
  "by_tipe": {
    "pilihan_ganda": 100,
    "essay": 30,
    "isian_singkat": 20
  },
  "by_tingkat": {
    "mudah": 50,
    "sedang": 70,
    "sulit": 30
  }
}
```

---

### Create Soal (Manual)

```http
POST /api/v2/bank-soal
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "tipe": "pilihan_ganda",
  "tingkat_kesulitan": "sedang",
  "pertanyaan": "Berapakah hasil dari 2 + 2?",
  "pilihan": [
    { "label": "A", "text": "3" },
    { "label": "B", "text": "4" },
    { "label": "C", "text": "5" },
    { "label": "D", "text": "6" }
  ],
  "jawaban_benar": "B",
  "pembahasan": "2 + 2 = 4"
}
```

---

### Bulk Create Soal

```http
POST /api/v2/bank-soal/bulk
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
[
  { "tipe": "essay", "pertanyaan": "...", "jawaban_benar": "..." },
  { "tipe": "essay", "pertanyaan": "...", "jawaban_benar": "..." }
]
```

---

### Generate Soal dengan AI 🤖

Generate multiple soal sekaligus dengan AI.

```http
POST /api/v2/bank-soal/generate
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "mapel": "Matematika",
  "topik": "Pengukuran Sudut",
  "kelas": "X SMA",
  "tipe": "pilihan_ganda",
  "tingkat_kesulitan": "sedang",
  "jumlah": 5,
  "model": "gemini-2.5-flash",
  "save_to_db": true
}
```

**Response (201):**
```json
{
  "count": 5,
  "soal": [
    {
      "id": "uuid",
      "tipe": "pilihan_ganda",
      "tingkat_kesulitan": "sedang",
      "pertanyaan": "Jika sudut A = 45°...",
      "pilihan": [...],
      "jawaban_benar": "B",
      "pembahasan": "..."
    },
    ...
  ],
  "ai_response": {
    "model": "gemini-2.5-flash",
    "usage": {...}
  }
}
```

---

### Update Soal

```http
PUT /api/v2/bank-soal/:id
Authorization: Bearer <token>
Content-Type: application/json
```

---

### Delete Soal

```http
DELETE /api/v2/bank-soal/:id
Authorization: Bearer <token>
```

## Tips Generate Soal

1. **Spesifik topik** - Semakin spesifik, semakin relevan soal yang dihasilkan
2. **Sesuaikan tingkat** - C1-C2 untuk evaluasi pemahaman dasar
3. **Variasi tipe** - Kombinasikan PG dan Essay untuk asesmen komprehensif
4. **Review pembahasan** - Selalu review pembahasan AI sebelum digunakan
