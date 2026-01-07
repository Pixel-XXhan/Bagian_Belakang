# Route yang Didukung Backend

## ✅ Dashboard Routes (Supported)

| Frontend Route | Backend Endpoint | Method |
|----------------|------------------|--------|
| `/dashboard` | `/api/v2/user-profile` | GET stats dari berbagai module |
| `/dashboard/modul-ajar` | `/api/v2/modul-ajar` | GET, POST |
| `/dashboard/modul-ajar/create` | `/api/v2/modul-ajar/generate` | POST |
| `/dashboard/modul-ajar/[id]` | `/api/v2/modul-ajar/:id` | GET, PUT, DELETE |
| `/dashboard/rpp` | `/api/v2/rpp` | GET, POST |
| `/dashboard/rpp/create` | `/api/v2/rpp/generate` | POST |
| `/dashboard/rpp/[id]` | `/api/v2/rpp/:id` | GET, PUT, DELETE |
| `/dashboard/silabus` | `/api/v2/silabus` | GET, POST |
| `/dashboard/silabus/create` | `/api/v2/silabus/generate` | POST |
| `/dashboard/silabus/[id]` | `/api/v2/silabus/:id` | GET, PUT, DELETE |
| `/dashboard/atp` | `/api/v2/atp` | GET, POST |
| `/dashboard/atp/create` | `/api/v2/atp/generate` | POST |
| `/dashboard/atp/[id]` | `/api/v2/atp/:id` | GET, PUT, DELETE |
| `/dashboard/lkpd` | `/api/v2/lkpd` | GET, POST |
| `/dashboard/lkpd/create` | `/api/v2/lkpd/generate` | POST |
| `/dashboard/lkpd/[id]` | `/api/v2/lkpd/:id` | GET, PUT, DELETE |
| `/dashboard/asesmen` | `/api/v2/asesmen` | GET, POST |
| `/dashboard/asesmen/create` | `/api/v2/asesmen/generate` | POST |
| `/dashboard/asesmen/[id]` | `/api/v2/asesmen/:id` | GET, PUT, DELETE |
| `/dashboard/bank-soal` | `/api/v2/bank-soal` | GET, POST |
| `/dashboard/bank-soal/create` | `/api/v2/bank-soal/generate` | POST |
| `/dashboard/bank-soal/[id]` | `/api/v2/bank-soal/:id` | GET, PUT, DELETE |
| `/dashboard/rubrik` | `/api/v2/rubrik` | GET, POST |
| `/dashboard/rubrik/create` | `/api/v2/rubrik/generate` | POST |
| `/dashboard/rubrik/[id]` | `/api/v2/rubrik/:id` | GET, PUT, DELETE |
| `/dashboard/kisi-kisi` | `/api/v2/kisi-kisi` | GET, POST |
| `/dashboard/kisi-kisi/create` | `/api/v2/kisi-kisi/generate` | POST |
| `/dashboard/kisi-kisi/[id]` | `/api/v2/kisi-kisi/:id` | GET, PUT, DELETE |
| `/dashboard/capaian-pembelajaran` | `/api/v2/cp` | GET |
| `/dashboard/capaian-pembelajaran/[id]` | `/api/v2/cp/:id` | GET |
| `/dashboard/tujuan-pembelajaran` | `/api/v2/tp` | GET, POST |
| `/dashboard/tujuan-pembelajaran/create` | `/api/v2/tp/generate` | POST |
| `/dashboard/tujuan-pembelajaran/[id]` | `/api/v2/tp/:id` | GET, PUT, DELETE |
| `/dashboard/materi` | `/api/v2/materi` | GET, POST |
| `/dashboard/materi/create` | `/api/v2/materi/generate` | POST |
| `/dashboard/materi/[id]` | `/api/v2/materi/:id` | GET, PUT, DELETE |
| `/dashboard/kegiatan` | `/api/v2/kegiatan` | GET, POST |
| `/dashboard/kegiatan/[id]` | `/api/v2/kegiatan/:id` | GET, PUT, DELETE |
| `/dashboard/templates` | `/api/v2/template` | GET, POST |
| `/dashboard/profile` | `/api/v2/user-profile` | GET, PUT |
| `/dashboard/settings` | `/api/v2/user-profile/preferences` | GET, PUT |

---

## 🔐 Auth Routes

| Frontend Route | Supabase Method |
|----------------|-----------------|
| `/login` | `supabase.auth.signInWithPassword()` |
| `/register` | `supabase.auth.signUp()` |
| `/forgot-password` | `supabase.auth.resetPasswordForEmail()` |
| OAuth Google | `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| OAuth Facebook | `supabase.auth.signInWithOAuth({ provider: 'facebook' })` |

---

## 🗑️ Routes yang TIDAK Didukung

| Route | Alasan |
|-------|--------|
| `/dashboard/kelas` | Tidak ada data siswa |
| `/dashboard/kelas/[id]` | Tidak ada tracking kelas |
| `/dashboard/calendar` | Tidak ada tabel events |
| `/dashboard/notifications` | Tidak ada notification service |
| `/dashboard/files` | Tidak ada file manager |
| `/dashboard/media/upload` | Storage hanya untuk export |

---

## 📖 Static Pages (Tidak Perlu Backend)

- `/` - Landing page
- `/fitur` - Features
- `/harga` - Pricing
- `/tentang` - About
- `/showcase` - Showcase
- `/kebijakan-privasi` - Privacy Policy
- `/syarat-ketentuan` - Terms of Service
- `/dashboard/bantuan` - Help Center
