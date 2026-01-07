# Asesmen API

Kelola asesmen diagnostik, formatif, dan sumatif.

## Base URL
```
/api/v2/asesmen
```

## Jenis Asesmen
| Jenis | Kapan | Tujuan |
|-------|-------|--------|
| `diagnostik` | Awal pembelajaran | Identifikasi kemampuan awal |
| `formatif` | Selama pembelajaran | Monitor progres |
| `sumatif` | Akhir pembelajaran | Evaluasi pencapaian |

## Endpoints

### List Asesmen

```http
GET /api/v2/asesmen
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| jenis | string | Filter by jenis |
| mapel_id | uuid | Filter by mapel |

---

### Create Asesmen

```http
POST /api/v2/asesmen
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "judul": "Asesmen Formatif Bab 1",
  "jenis": "formatif",
  "mapel_id": "uuid",
  "kelas": "X",
  "kriteria_ketercapaian": [...]
}
```

---

### Generate Asesmen dengan AI 🤖

```http
POST /api/v2/asesmen/generate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mapel": "Matematika",
  "topik": "Aljabar",
  "kelas": "X SMA",
  "jenis": "formatif"
}
```

---

### Update/Delete

```http
PUT /api/v2/asesmen/:id
DELETE /api/v2/asesmen/:id
Authorization: Bearer <token>
```
