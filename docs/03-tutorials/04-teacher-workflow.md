# Tutorial: Workflow Lengkap Guru

Panduan alur kerja lengkap untuk guru menggunakan RPP Generator.

## 🎯 Scenario

Pak Guru akan mengajar topik "Hukum Newton" di kelas X. Ia membutuhkan:
1. ✅ Capaian Pembelajaran
2. ✅ Tujuan Pembelajaran
3. ✅ RPP lengkap
4. ✅ LKPD
5. ✅ Bank Soal
6. ✅ Export PDF

## Step 1: Lookup Capaian Pembelajaran

```bash
curl -X POST http://localhost:3001/api/v2/cp/lookup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mapel": "Fisika",
    "fase": "E"
  }'
```

Response akan berisi CP resmi dari Kurikulum Merdeka.

## Step 2: Generate Tujuan Pembelajaran

```bash
curl -X POST http://localhost:3001/api/v2/tp/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mapel": "Fisika",
    "topik": "Hukum Newton",
    "kelas": "X SMA",
    "capaian_pembelajaran": "Peserta didik mampu menerapkan konsep...",
    "jumlah": 4
  }'
```

## Step 3: Generate RPP

```bash
curl -X POST http://localhost:3001/api/v2/rpp/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mapel": "Fisika",
    "topik": "Hukum Newton",
    "kelas": "X SMA",
    "kurikulum": "Kurikulum Merdeka",
    "alokasi_waktu": 135
  }'
```

## Step 4: Generate LKPD

```bash
curl -X POST http://localhost:3001/api/v2/lkpd/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mapel": "Fisika",
    "topik": "Hukum Newton III",
    "kelas": "X SMA",
    "jenis_kegiatan": "kelompok",
    "durasi": 45
  }'
```

## Step 5: Generate Bank Soal

```bash
# Soal untuk evaluasi formatif
curl -X POST http://localhost:3001/api/v2/bank-soal/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mapel": "Fisika",
    "topik": "Hukum Newton",
    "kelas": "X SMA",
    "tipe": "pilihan_ganda",
    "tingkat_kesulitan": "sedang",
    "jumlah": 10
  }'
```

## Step 6: Generate Kisi-Kisi

```bash
curl -X POST http://localhost:3001/api/v2/kisi-kisi/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mapel": "Fisika",
    "topik": "Hukum Newton",
    "kelas": "X SMA",
    "jenis_ujian": "Ulangan Harian",
    "jumlah_soal": 20
  }'
```

## Step 7: Export RPP ke PDF

```bash
curl -X POST http://localhost:3001/api/v2/export/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mapel": "Fisika",
    "topik": "Hukum Newton",
    "kelas": "X SMA",
    "document_type": "rpp",
    "format": "pdf"
  }'
```

## Workflow Diagram

```
┌─────────────────┐
│   1. CP Lookup  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. Generate TP │ ◄── SMART criteria
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. Generate RPP │ ◄── Kegiatan lengkap
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│ LKPD  │ │ Soal  │
└───┬───┘ └───┬───┘
    │         │
    └────┬────┘
         │
         ▼
┌─────────────────┐
│  Export PDF     │
└─────────────────┘
```

## Best Practices

### Waktu Persiapan
| Dokumen | Waktu Generate | Waktu Review |
|---------|----------------|--------------|
| CP Lookup | 5 detik | 2 menit |
| TP | 10 detik | 5 menit |
| RPP | 30 detik | 10 menit |
| LKPD | 15 detik | 5 menit |
| Bank Soal (10) | 20 detik | 10 menit |
| **Total** | **~1 menit** | **~30 menit** |

### Checklist Sebelum Mengajar
- [ ] Review TP sesuai CP
- [ ] Review kegiatan pembelajaran
- [ ] Review alokasi waktu
- [ ] Print LKPD
- [ ] Siapkan soal evaluasi
- [ ] Siapkan media pembelajaran

## Next Steps

- [Streaming Response](./05-streaming.md) - Untuk UX lebih baik
- [Error Handling](./09-error-handling.md) - Penanganan error
