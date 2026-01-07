# Tujuan Pembelajaran API

Kelola Tujuan Pembelajaran dengan kriteria SMART.

## Base URL
```
/api/v2/tp
```

## Endpoints

### List TP

```http
GET /api/v2/tp
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| atp_id | uuid | Filter by ATP |
| mapel_id | uuid | Filter by mapel |
| kelas | string | Filter by kelas |

---

### Get by ID

```http
GET /api/v2/tp/:id
Authorization: Bearer <token>
```

---

### Create TP

```http
POST /api/v2/tp
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "deskripsi": "Peserta didik dapat mengukur sudut...",
  "kelas": "X",
  "alokasi_waktu": 45,
  "indikator": ["Indikator 1", "Indikator 2"],
  "kata_kerja_operasional": "Menganalisis",
  "level_kognitif": "C4"
}
```

---

### Bulk Create

```http
POST /api/v2/tp/bulk
Authorization: Bearer <token>
```

**Request Body:** Array of TP objects

---

### Generate TP dengan AI 🤖

```http
POST /api/v2/tp/generate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mapel": "Matematika",
  "topik": "Pengukuran Sudut",
  "kelas": "X SMA",
  "jumlah": 4
}
```

**Response:**
```json
{
  "count": 4,
  "tujuan_pembelajaran": [
    {
      "deskripsi": "...",
      "kata_kerja_operasional": "Menganalisis",
      "level_kognitif": "C4",
      "indikator": [...]
    }
  ]
}
```

---

### Update/Delete

```http
PUT /api/v2/tp/:id
DELETE /api/v2/tp/:id
Authorization: Bearer <token>
```
