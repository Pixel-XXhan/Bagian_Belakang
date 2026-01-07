# Kegiatan Pembelajaran API

Generate kegiatan pembelajaran (Pendahuluan, Inti, Penutup).

## Base URL
```
/api/v2/kegiatan
```

## Fase Kegiatan
| Fase | Durasi (%) |
|------|------------|
| `pendahuluan` | ~15% |
| `inti` | ~70% |
| `penutup` | ~15% |

## Endpoints

### List Kegiatan

```http
GET /api/v2/kegiatan
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| rpp_id | uuid | Filter by RPP |
| fase | string | Filter by fase |

---

### Create Kegiatan

```http
POST /api/v2/kegiatan
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "nama": "Kegiatan Inti",
  "fase": "inti",
  "durasi": 65,
  "langkah": ["Langkah 1", "Langkah 2"],
  "metode": "Discovery Learning"
}
```

---

### Bulk Create

```http
POST /api/v2/kegiatan/bulk
Authorization: Bearer <token>
```

---

### Generate Kegiatan dengan AI 🤖

```http
POST /api/v2/kegiatan/generate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mapel": "Fisika",
  "topik": "Hukum Newton",
  "kelas": "X SMA",
  "model_pembelajaran": "Discovery Learning",
  "alokasi_waktu": 90
}
```

**Response:**
```json
{
  "model_pembelajaran": "Discovery Learning",
  "alokasi_waktu": 90,
  "kegiatan": [
    { "fase": "pendahuluan", "durasi": 10, "langkah": [...] },
    { "fase": "inti", "durasi": 65, "langkah": [...] },
    { "fase": "penutup", "durasi": 15, "langkah": [...] }
  ]
}
```

---

### Update/Delete

```http
PUT /api/v2/kegiatan/:id
DELETE /api/v2/kegiatan/:id
Authorization: Bearer <token>
```
