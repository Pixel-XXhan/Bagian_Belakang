# Rubrik Penilaian API

Generate rubrik penilaian dengan kriteria dan level.

## Base URL
```
/api/v2/rubrik
```

## Jenis Penilaian
- `sikap` - Penilaian sikap
- `pengetahuan` - Penilaian pengetahuan
- `keterampilan` - Penilaian keterampilan
- `proyek` - Penilaian proyek
- `portofolio` - Penilaian portofolio

## Skala Penilaian
- `1-4` - Kurang, Cukup, Baik, Sangat Baik
- `1-100` - Skala persentase
- `A-E` - Grade huruf

## Endpoints

### List Rubrik

```http
GET /api/v2/rubrik
Authorization: Bearer <token>
```

---

### Create Rubrik

```http
POST /api/v2/rubrik
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "judul": "Rubrik Penilaian Presentasi",
  "jenis_penilaian": "keterampilan",
  "skala": "1-4",
  "kriteria": [
    {
      "aspek": "Konten",
      "bobot": 30,
      "deskriptor": {
        "1": "Tidak sesuai topik",
        "2": "Kurang lengkap",
        "3": "Cukup lengkap",
        "4": "Sangat lengkap"
      }
    }
  ]
}
```

---

### Generate Rubrik dengan AI 🤖

```http
POST /api/v2/rubrik/generate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mapel": "Bahasa Indonesia",
  "topik": "Menulis Teks Eksposisi",
  "kelas": "X SMA",
  "jenis_penilaian": "keterampilan",
  "skala": "1-4"
}
```

---

### Update/Delete

```http
PUT /api/v2/rubrik/:id
DELETE /api/v2/rubrik/:id
Authorization: Bearer <token>
```
