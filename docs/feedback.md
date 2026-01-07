# Frontend-Backend Compatibility Feedback

**Date:** 7 Januari 2026  
**Reviewer:** Backend Developer

---

## 🗑️ HAPUS HALAMAN INI (Backend Tidak Support)

| No | Route | Alasan Hapus |
|----|-------|--------------|
| 1 | `/dashboard/kelas` | ❌ Tidak ada data siswa, tidak ada tracking per kelas |
| 2 | `/dashboard/kelas/[id]` | ❌ Tidak ada data siswa, nilai, kehadiran |
| 3 | `/dashboard/calendar` | ❌ Tidak ada tabel events di database |
| 4 | `/dashboard/notifications` | ❌ Tidak ada notification system |
| 5 | `/dashboard/files` | ❌ Tidak ada file manager, hanya storage export |
| 6 | `/dashboard/media/upload` | ❌ Storage hanya untuk export, bukan upload media |
| 7 | `/dashboard/analytics` | ❌ Khusus bagian "statistik siswa", "tingkat penyelesaian", "KKM" |

---

## ⚠️ MODIFIKASI HALAMAN INI

| Route | Yang Perlu Diubah |
|-------|-------------------|
| `/dashboard/media` | Ganti jadi "Rekomendasi Media AI" bukan gallery upload |
| `/dashboard/templates` | Hapus field rating & download count (tidak ada di backend) |
| `/dashboard/kegiatan` | Hapus status tracking (Selesai/Berlangsung/Terjadwal) |

---

## ✅ PERTAHANKAN (Fully Supported)

| Route | Backend Module |
|-------|----------------|
| `/dashboard` | ✅ Dashboard (statistik dokumen saja) |
| `/dashboard/modul-ajar/*` | ✅ ModulAjarModule |
| `/dashboard/rpp/*` | ✅ RppModule |
| `/dashboard/silabus/*` | ✅ SilabusModule |
| `/dashboard/atp/*` | ✅ AtpModule |
| `/dashboard/lkpd/*` | ✅ LkpdModule |
| `/dashboard/asesmen/*` | ✅ AsesmenModule |
| `/dashboard/bank-soal/*` | ✅ BankSoalModule |
| `/dashboard/rubrik/*` | ✅ RubrikModule |
| `/dashboard/kisi-kisi/*` | ✅ KisiKisiModule |
| `/dashboard/capaian-pembelajaran/*` | ✅ CapaianPembelajaranModule |
| `/dashboard/tujuan-pembelajaran/*` | ✅ TujuanPembelajaranModule |
| `/dashboard/materi/*` | ✅ MateriModule |
| `/dashboard/kegiatan/*` | ✅ KegiatanModule |
| `/dashboard/templates` | ✅ TemplateModule |
| `/dashboard/profile` | ✅ UserProfileModule |
| `/dashboard/settings` | ✅ UserPreferencesModule |
| `/dashboard/search` | ✅ Bisa pakai query params di setiap module |
| `/dashboard/bantuan` | ✅ Static page, tidak perlu backend |
| `/login`, `/register`, `/forgot-password` | ✅ AuthModule |
| Landing pages (`/`, `/fitur`, `/harga`, dll) | ✅ Static pages |

---

## 📊 Ringkasan

| Status | Jumlah |
|--------|--------|
| 🗑️ **HAPUS** | 7 halaman |
| ⚠️ **MODIFIKASI** | 3 halaman |
| ✅ **PERTAHANKAN** | 48 halaman |

---

## API Endpoint Utama

```
POST /api/v1/ai/chat          → Semua AI generation
POST /api/v1/ai/chat/stream   → Streaming
GET  /api/v1/ai/models        → Daftar model AI
/api/v2/{module}/*            → CRUD setiap module
/api/health                    → Health check
```

---

*Backend: 28 modules aktif, 160+ endpoints*
