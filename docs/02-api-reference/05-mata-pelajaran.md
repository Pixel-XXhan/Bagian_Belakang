# Mata Pelajaran API

Kelola data mata pelajaran.

## Base URL
```
/api/v2/mapel
```

## Endpoints

### List Mata Pelajaran

```http
GET /api/v2/mapel
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| jenjang_id | uuid | Filter by jenjang |
| kurikulum_id | uuid | Filter by kurikulum |
| search | string | Search by nama |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nama": "Matematika",
    "kode": "MTK",
    "jenjang": { "id": "uuid", "nama": "SMA" },
    "kurikulum": { "id": "uuid", "nama": "Kurikulum Merdeka" }
  }
]
```

---

### Get by ID

```http
GET /api/v2/mapel/:id
Authorization: Bearer <token>
```

---

### Create Mata Pelajaran

```http
POST /api/v2/mapel
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "nama": "Fisika",
  "kode": "FIS",
  "jenjang_id": "uuid",
  "kurikulum_id": "uuid",
  "deskripsi": "Mata pelajaran Fisika"
}
```

---

### Update/Delete

```http
PUT /api/v2/mapel/:id
DELETE /api/v2/mapel/:id
Authorization: Bearer <token>
```
