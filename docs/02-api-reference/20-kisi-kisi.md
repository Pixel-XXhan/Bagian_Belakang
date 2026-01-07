# Kisi-Kisi Soal API

Generate kisi-kisi soal ujian.

## Base URL
```
/api/v2/kisi-kisi
```

## Jenis Ujian
- `Ulangan Harian`
- `PTS` (Penilaian Tengah Semester)
- `PAS` (Penilaian Akhir Semester)
- `PAT` (Penilaian Akhir Tahun)

## Level Kognitif (Taksonomi Bloom)
| Level | Deskripsi | Kata Kerja |
|-------|-----------|------------|
| C1 | Mengingat | Menyebutkan, mendaftar |
| C2 | Memahami | Menjelaskan, menguraikan |
| C3 | Menerapkan | Menghitung, menggunakan |
| C4 | Menganalisis | Membandingkan, menganalisis |
| C5 | Mengevaluasi | Menilai, menyimpulkan |
| C6 | Mencipta | Merancang, membuat |

## Endpoints

### List Kisi-Kisi

```http
GET /api/v2/kisi-kisi
Authorization: Bearer <token>
```

---

### Create Kisi-Kisi

```http
POST /api/v2/kisi-kisi
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "judul": "Kisi-Kisi PAS Matematika",
  "jenis_ujian": "PAS",
  "kelas": "X",
  "indikator_soal": [
    {
      "kompetensi_dasar": "3.1",
      "materi": "Aljabar",
      "indikator": "Menentukan nilai x",
      "level_kognitif": "C3",
      "nomor_soal": [1, 2, 3]
    }
  ]
}
```

---

### Generate Kisi-Kisi dengan AI 🤖

```http
POST /api/v2/kisi-kisi/generate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mapel": "Matematika",
  "topik": "Aljabar, Geometri",
  "kelas": "X SMA",
  "jenis_ujian": "PAS",
  "jumlah_soal": 40
}
```

---

### Update/Delete

```http
PUT /api/v2/kisi-kisi/:id
DELETE /api/v2/kisi-kisi/:id
Authorization: Bearer <token>
```
