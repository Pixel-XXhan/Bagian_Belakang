# Media Pembelajaran API

Kelola media pembelajaran dan dapatkan rekomendasi AI.

## Base URL
```
/api/v2/media
```

## Jenis Media
| Jenis | Deskripsi |
|-------|-----------|
| `video` | Video pembelajaran |
| `gambar` | Gambar/infografis |
| `audio` | Audio/podcast |
| `interaktif` | Media interaktif |
| `dokumen` | Dokumen PDF/PPT |

## Endpoints

### List Media

```http
GET /api/v2/media
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| jenis | string | Filter by jenis |
| mapel_id | uuid | Filter by mapel |

---

### Get Statistics

```http
GET /api/v2/media/statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total": 50,
  "by_jenis": {
    "video": 20,
    "gambar": 15,
    "interaktif": 10,
    "audio": 5
  }
}
```

---

### Create Media

```http
POST /api/v2/media
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "judul": "Video Hukum Newton",
  "jenis": "video",
  "url": "https://youtube.com/...",
  "deskripsi": "...",
  "topik": ["Fisika", "Hukum Newton"],
  "kelas": ["X", "XI"]
}
```

---

### Get Recommendations 🤖

```http
POST /api/v2/media/recommend
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mapel": "Fisika",
  "topik": "Hukum Newton",
  "kelas": "X SMA"
}
```

---

### Update/Delete

```http
PUT /api/v2/media/:id
DELETE /api/v2/media/:id
Authorization: Bearer <token>
```
