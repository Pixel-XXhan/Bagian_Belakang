# ATP (Alur Tujuan Pembelajaran) API

Kelola Alur Tujuan Pembelajaran.

## Base URL
```
/api/v2/atp
```

## Endpoints

### List ATP

```http
GET /api/v2/atp
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| mapel_id | uuid | Filter by mapel |
| fase | string | Filter by fase |

---

### Get by ID

```http
GET /api/v2/atp/:id
Authorization: Bearer <token>
```

---

### Create ATP

```http
POST /api/v2/atp
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "judul": "ATP Matematika Fase E",
  "fase": "E",
  "kelas": "X",
  "tujuan_pembelajaran": [
    { "urutan": 1, "deskripsi": "..." },
    { "urutan": 2, "deskripsi": "..." }
  ]
}
```

---

### Generate ATP dengan AI 🤖

```http
POST /api/v2/atp/generate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mapel": "Matematika",
  "fase": "E",
  "capaian_pembelajaran": "..."
}
```

---

### Update/Delete

```http
PUT /api/v2/atp/:id
DELETE /api/v2/atp/:id
Authorization: Bearer <token>
```
