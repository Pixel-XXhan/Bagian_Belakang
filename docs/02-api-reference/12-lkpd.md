# LKPD API

Generate dan kelola Lembar Kerja Peserta Didik.

## Base URL
```
/api/v2/lkpd
```

## Jenis Kegiatan
- `individu` - Kegiatan mandiri
- `kelompok` - Kegiatan berkelompok
- `praktikum` - Kegiatan praktikum

## Endpoints

### List LKPD

```http
GET /api/v2/lkpd
Authorization: Bearer <token>
```

---

### Get by ID

```http
GET /api/v2/lkpd/:id
Authorization: Bearer <token>
```

---

### Create LKPD

```http
POST /api/v2/lkpd
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "judul": "LKPD Praktikum Hukum Newton",
  "mapel_id": "uuid",
  "kelas": "X",
  "jenis_kegiatan": "praktikum",
  "petunjuk": "...",
  "langkah_kegiatan": ["Langkah 1", "Langkah 2"]
}
```

---

### Generate LKPD dengan AI 🤖

```http
POST /api/v2/lkpd/generate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mapel": "Fisika",
  "topik": "Hukum Newton III",
  "kelas": "X SMA",
  "jenis_kegiatan": "kelompok",
  "durasi": 45
}
```

---

### Update/Delete

```http
PUT /api/v2/lkpd/:id
DELETE /api/v2/lkpd/:id
Authorization: Bearer <token>
```
