# 02 - API Reference

Referensi lengkap semua API endpoints RPP Generator.

## 📚 Daftar Modul (25 Aktif)

### Core & Auth
- [01 - Authentication](./01-auth.md) - Login, Register, Token

### Master Data
- [02 - User Profile](./02-user-profile.md) - Profil & Preferensi
- [03 - Kurikulum](./03-kurikulum.md) - Data Kurikulum
- [04 - Jenjang](./04-jenjang.md) - Jenjang Pendidikan
- [05 - Mata Pelajaran](./05-mata-pelajaran.md) - Data Mapel
- 22 - Kelas - Data Kelas (1-12, X-XII)
- 23 - Semester - Data Semester (Ganjil/Genap)
- 24 - Kompetensi Dasar - KD dengan AI Lookup

### Curriculum Planning
- [06 - Capaian Pembelajaran](./06-capaian-pembelajaran.md) - CP Kurikulum Merdeka
- [07 - ATP](./07-atp.md) - Alur Tujuan Pembelajaran
- [08 - Tujuan Pembelajaran](./08-tujuan-pembelajaran.md) - TP SMART

### Document Generation
- [09 - RPP](./09-rpp.md) - Rencana Pelaksanaan Pembelajaran
- [10 - Silabus](./10-silabus.md) - Silabus
- [11 - Modul Ajar](./11-modul-ajar.md) - Modul Ajar
- [12 - LKPD](./12-lkpd.md) - Lembar Kerja Peserta Didik
- [13 - Kegiatan](./13-kegiatan.md) - Kegiatan Pembelajaran
- [14 - Export](./14-export.md) - PDF/DOCX Export

### Teaching Materials
- [15 - Materi](./15-materi.md) - Materi Pembelajaran
- [16 - Media](./16-media.md) - Media Pembelajaran
- [17 - Bahan Ajar](./17-bahan-ajar.md) - Bahan Ajar

### Assessment
- [18 - Bank Soal](./18-bank-soal.md) - Bank Soal + AI Generate
- [19 - Asesmen](./19-asesmen.md) - Asesmen
- [20 - Kisi-Kisi](./20-kisi-kisi.md) - Kisi-Kisi Soal
- [21 - Rubrik](./21-rubrik.md) - Rubrik Penilaian

## 🔐 Authentication

Semua endpoint (kecuali auth & health) memerlukan JWT token:

```
Authorization: Bearer <your_access_token>
```

## 📊 Response Format

### Success Response
```json
{
  "id": "uuid",
  "field": "value",
  "created_at": "2026-01-06T12:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request",
  "timestamp": "...",
  "path": "/api/v2/..."
}
```

## 🔄 Pagination

```
GET /api/v2/resource?limit=10&offset=0
```

## 🔍 Filtering & Search

```
GET /api/v2/resource?search=keyword&mapel_id=uuid
```

## 🏥 Health Check

```
GET /api/health        # Full health status
GET /api/health/ping   # Simple ping
```
