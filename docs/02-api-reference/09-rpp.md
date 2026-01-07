# RPP API

Generate dan kelola Rencana Pelaksanaan Pembelajaran.

## Base URL
```
/api/v2/rpp
```

## Endpoints

### List RPP

```http
GET /api/v2/rpp
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Cari berdasarkan judul |
| mapel_id | uuid | Filter by mata pelajaran |
| status | string | Filter by status (draft/published) |
| limit | number | Limit results (default: 10) |
| offset | number | Offset for pagination |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "judul": "RPP Matematika - Pengukuran Sudut",
    "kelas": "X",
    "materi_pokok": "Pengukuran Sudut",
    "alokasi_waktu": 90,
    "status": "draft",
    "created_at": "2026-01-06T12:00:00Z"
  }
]
```

---

### Get RPP by ID

```http
GET /api/v2/rpp/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "judul": "RPP Matematika - Pengukuran Sudut",
  "kelas": "X",
  "materi_pokok": "Pengukuran Sudut",
  "alokasi_waktu": 90,
  "tujuan_pembelajaran": ["TP1", "TP2"],
  "kegiatan": {
    "pendahuluan": [...],
    "inti": [...],
    "penutup": [...]
  },
  "asesmen": {...},
  "konten_lengkap": {...}
}
```

---

### Create RPP (Manual)

```http
POST /api/v2/rpp
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "judul": "RPP Matematika - Aljabar",
  "mapel_id": "uuid",
  "kelas": "X",
  "materi_pokok": "Aljabar Dasar",
  "alokasi_waktu": 90,
  "tujuan_pembelajaran": ["Siswa dapat memahami..."]
}
```

---

### Generate RPP (AI)

```http
POST /api/v2/rpp/generate
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "mapel": "Matematika",
  "topik": "Pengukuran Sudut",
  "kelas": "X SMA",
  "kurikulum": "Kurikulum Merdeka",
  "alokasi_waktu": 90,
  "model": "gemini-2.5-flash",
  "save_to_db": true
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "judul": "RPP Pengukuran Sudut",
  "konten_lengkap": {
    "identitas": {...},
    "tujuan_pembelajaran": [...],
    "kegiatan": {...},
    "asesmen": {...}
  },
  "ai_response": {
    "model": "gemini-2.5-flash",
    "usage": {
      "promptTokens": 500,
      "completionTokens": 2000
    }
  }
}
```

---

### Generate RPP (Streaming)

```http
POST /api/v2/rpp/generate/stream
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** Same as generate

**Response:** Server-Sent Events (SSE)
```
data: {"content": "# RPP Matematika\n\n"}
data: {"content": "## Identitas\n"}
data: {"content": "- Mapel: Matematika\n"}
data: [DONE]
```

---

### Update RPP

```http
PUT /api/v2/rpp/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "judul": "Updated Title",
  "status": "published"
}
```

---

### Delete RPP

```http
DELETE /api/v2/rpp/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "RPP berhasil dihapus"
}
```
