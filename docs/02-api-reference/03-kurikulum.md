# Kurikulum API

Kelola data master kurikulum.

## Base URL
```
/api/v2/kurikulum
```

## Endpoints

### List Kurikulum

```http
GET /api/v2/kurikulum
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nama": "Kurikulum Merdeka",
    "kode": "K13M",
    "deskripsi": "Kurikulum terbaru 2022",
    "aktif": true
  },
  {
    "id": "uuid",
    "nama": "Kurikulum 2013",
    "kode": "K13",
    "deskripsi": "Kurikulum 2013 Revisi",
    "aktif": true
  }
]
```

---

### Get by ID

```http
GET /api/v2/kurikulum/:id
Authorization: Bearer <token>
```

---

### Create Kurikulum

```http
POST /api/v2/kurikulum
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "nama": "Kurikulum Baru",
  "kode": "KBARU",
  "deskripsi": "Deskripsi kurikulum"
}
```

---

### Update Kurikulum

```http
PUT /api/v2/kurikulum/:id
Authorization: Bearer <token>
```

---

### Delete Kurikulum

```http
DELETE /api/v2/kurikulum/:id
Authorization: Bearer <token>
```
