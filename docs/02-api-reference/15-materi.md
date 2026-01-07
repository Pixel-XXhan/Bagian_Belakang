# Materi Pembelajaran API

Generate dan kelola materi pembelajaran.

## Base URL
```
/api/v2/materi
```

## Endpoints

### List Materi

```http
GET /api/v2/materi
Authorization: Bearer <token>
```

---

### Get by ID

```http
GET /api/v2/materi/:id
Authorization: Bearer <token>
```

---

### Create Materi

```http
POST /api/v2/materi
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "judul": "Materi Pengukuran Sudut",
  "kelas": "X",
  "bab": "Trigonometri",
  "ringkasan": "...",
  "poin_penting": ["Poin 1", "Poin 2"],
  "kata_kunci": ["sudut", "derajat", "radian"]
}
```

---

### Generate Materi dengan AI 🤖

```http
POST /api/v2/materi/generate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mapel": "Matematika",
  "topik": "Pengukuran Sudut",
  "kelas": "X SMA"
}
```

---

### Generate Materi (Streaming) 🔄

```http
POST /api/v2/materi/generate/stream
Authorization: Bearer <token>
```

---

### Update/Delete

```http
PUT /api/v2/materi/:id
DELETE /api/v2/materi/:id
Authorization: Bearer <token>
```
