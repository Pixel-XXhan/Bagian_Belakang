# Modul Ajar API

Generate dan kelola Modul Ajar.

## Base URL
```
/api/v2/modul-ajar
```

## Endpoints

### List Modul Ajar

```http
GET /api/v2/modul-ajar
Authorization: Bearer <token>
```

---

### Get by ID

```http
GET /api/v2/modul-ajar/:id
Authorization: Bearer <token>
```

---

### Create Modul Ajar

```http
POST /api/v2/modul-ajar
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "judul": "Modul Ajar Pengukuran Sudut",
  "mapel_id": "uuid",
  "kelas": "X",
  "topik": "Pengukuran Sudut",
  "alokasi_waktu": 135
}
```

---

### Generate Modul Ajar dengan AI 🤖

```http
POST /api/v2/modul-ajar/generate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mapel": "Matematika",
  "topik": "Pengukuran Sudut",
  "kelas": "X SMA",
  "alokasi_waktu": 135
}
```

---

### Generate (Streaming) 🔄

```http
POST /api/v2/modul-ajar/generate/stream
Authorization: Bearer <token>
```

---

### Update/Delete

```http
PUT /api/v2/modul-ajar/:id
DELETE /api/v2/modul-ajar/:id
Authorization: Bearer <token>
```
