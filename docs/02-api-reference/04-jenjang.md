# Jenjang API

Kelola data jenjang pendidikan.

## Base URL
```
/api/v2/jenjang
```

## Jenjang yang Tersedia
- SD (Sekolah Dasar)
- SMP (Sekolah Menengah Pertama)
- SMA (Sekolah Menengah Atas)
- SMK (Sekolah Menengah Kejuruan)

## Endpoints

### List Jenjang

```http
GET /api/v2/jenjang
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  { "id": "uuid", "nama": "SD", "kode": "SD", "urutan": 1 },
  { "id": "uuid", "nama": "SMP", "kode": "SMP", "urutan": 2 },
  { "id": "uuid", "nama": "SMA", "kode": "SMA", "urutan": 3 },
  { "id": "uuid", "nama": "SMK", "kode": "SMK", "urutan": 4 }
]
```

---

### Get by ID

```http
GET /api/v2/jenjang/:id
Authorization: Bearer <token>
```

---

### Create Jenjang

```http
POST /api/v2/jenjang
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "nama": "MI",
  "kode": "MI",
  "urutan": 5
}
```

---

### Update/Delete

```http
PUT /api/v2/jenjang/:id
DELETE /api/v2/jenjang/:id
Authorization: Bearer <token>
```
