# Silabus API

Generate dan kelola Silabus.

## Base URL
```
/api/v2/silabus
```

## Endpoints

### List Silabus

```http
GET /api/v2/silabus
Authorization: Bearer <token>
```

---

### Get by ID

```http
GET /api/v2/silabus/:id
Authorization: Bearer <token>
```

---

### Create Silabus

```http
POST /api/v2/silabus
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "judul": "Silabus Matematika Kelas X",
  "mapel_id": "uuid",
  "kelas": "X",
  "semester": 1,
  "konten": {...}
}
```

---

### Generate Silabus dengan AI 🤖

```http
POST /api/v2/silabus/generate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mapel": "Matematika",
  "kelas": "X SMA",
  "semester": 1,
  "kurikulum": "Kurikulum Merdeka"
}
```

---

### Generate Silabus (Streaming) 🔄

```http
POST /api/v2/silabus/generate/stream
Authorization: Bearer <token>
```

Returns Server-Sent Events (SSE).

---

### Update/Delete

```http
PUT /api/v2/silabus/:id
DELETE /api/v2/silabus/:id
Authorization: Bearer <token>
```
