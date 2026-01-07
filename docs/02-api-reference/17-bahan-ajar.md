# Bahan Ajar API

Generate berbagai jenis bahan ajar.

## Base URL
```
/api/v2/bahan-ajar
```

## Jenis Bahan Ajar
| Jenis | Deskripsi |
|-------|-----------|
| `handout` | Ringkasan materi |
| `buku` | Bab buku pelajaran |
| `modul` | Modul pembelajaran |
| ` brosur` | Brosur informatif |
| `lembar_info` | Lembar informasi |
| `poster` | Konten poster |
| `infografis` | Konten infografis |

## Endpoints

### List Bahan Ajar

```http
GET /api/v2/bahan-ajar
Authorization: Bearer <token>
```

---

### Create Bahan Ajar

```http
POST /api/v2/bahan-ajar
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "judul": "Handout Trigonometri",
  "jenis": "handout",
  "kelas": "X",
  "deskripsi": "...",
  "konten_text": "..."
}
```

---

### Generate Bahan Ajar dengan AI 🤖

```http
POST /api/v2/bahan-ajar/generate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mapel": "Matematika",
  "topik": "Trigonometri",
  "kelas": "X SMA",
  "jenis": "handout"
}
```

---

### Update/Delete

```http
PUT /api/v2/bahan-ajar/:id
DELETE /api/v2/bahan-ajar/:id
Authorization: Bearer <token>
```
