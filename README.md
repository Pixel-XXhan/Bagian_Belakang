# RPP Generator API

Backend API untuk aplikasi RPP Generator - Platform AI untuk guru Indonesia.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan kredensial Anda

# Run development server
npm run start:dev

# Access
# API: http://localhost:3001
# Swagger: http://localhost:3001/api/docs
```

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | NestJS 11 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT) |
| AI | Google Gemini 2.5 |
| Storage | Supabase Storage |
| Docs | Swagger/OpenAPI |

## 📁 Project Structure

```
src/
├── auth/                 # Authentication (Supabase OAuth)
├── gemini/               # Gemini AI integration
├── openrouter/           # OpenRouter AI (Claude, GPT)
├── supabase/             # Supabase client
├── common/               # Guards, filters, decorators
│
├── user-profile/         # User management
├── kurikulum/            # Kurikulum master data
├── jenjang/              # Jenjang pendidikan
├── mata-pelajaran/       # Mata pelajaran
│
├── capaian-pembelajaran/ # CP Kurikulum Merdeka
├── atp/                  # Alur Tujuan Pembelajaran
├── tujuan-pembelajaran/  # Tujuan Pembelajaran
│
├── rpp/                  # RPP (+ AI generate + streaming)
├── silabus/              # Silabus
├── modul-ajar/           # Modul Ajar
├── lkpd/                 # Lembar Kerja Peserta Didik
├── kegiatan/             # Kegiatan Pembelajaran
│
├── materi/               # Materi Pembelajaran
├── media/                # Media Pembelajaran
├── bahan-ajar/           # Bahan Ajar
│
├── bank-soal/            # Bank Soal (+ AI generate)
├── asesmen/              # Asesmen
├── kisi-kisi/            # Kisi-Kisi Soal
├── rubrik/               # Rubrik Penilaian
│
└── export/               # Export PDF/DOCX
```

## 🔧 Environment Variables

Lihat `.env.example` untuk daftar lengkap.

## 📊 API Modules (21 Active)

| Category | Modules |
|----------|---------|
| **Core** | Auth, Gemini, OpenRouter |
| **Master Data** | UserProfile, Kurikulum, Jenjang, MataPelajaran |
| **Curriculum** | CP, ATP, TujuanPembelajaran |
| **Documents** | RPP, Silabus, ModulAjar, LKPD, Kegiatan |
| **Materials** | Materi, Media, BahanAjar |
| **Assessment** | BankSoal, Asesmen, KisiKisi, Rubrik |
| **Utility** | Export (PDF/DOCX) |

## 🔐 Authentication

Semua endpoint (kecuali auth) memerlukan JWT token:

```
Authorization: Bearer <access_token>
```

## 📚 API Documentation

- **Swagger UI**: `http://localhost:3001/api/docs`
- **Docs Folder**: `./docs/`

## 🏃 Scripts

```bash
npm run start:dev    # Development (hot reload)
npm run build        # Build for production
npm run start:prod   # Run production
npm run lint         # Lint code
npm run format       # Format code
```

## 📖 Full Documentation

Lihat folder `docs/` untuk dokumentasi lengkap:
- [Getting Started](./docs/01-getting-started/)
- [API Reference](./docs/02-api-reference/)
- [Tutorials](./docs/03-tutorials/)
- [Architecture](./docs/04-architecture/)
- [Deployment](./docs/05-deployment/)

## 🔗 Related

- [Supabase](https://supabase.com)
- [Google AI Studio](https://aistudio.google.com)
- [NestJS](https://nestjs.com)

---

Made with ❤️ for Guru Indonesia
