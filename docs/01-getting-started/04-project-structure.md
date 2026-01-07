# Project Structure

Panduan struktur folder dan file project.

## 📁 Root Structure

```
back_end_rpp/
├── src/                    # Source code utama
├── dist/                   # Build output
├── db/                     # Database migrations
├── docs/                   # Dokumentasi
├── node_modules/           # Dependencies
├── .env                    # Environment variables
├── .env.example            # Template env
├── nest-cli.json           # NestJS CLI config
├── package.json            # Dependencies list
└── tsconfig.json           # TypeScript config
```

## 📁 Source Code Structure

```
src/
├── main.ts                 # Entry point
├── app.module.ts           # Root module
├── app.controller.ts       # Health check
├── app.service.ts          # App service
│
├── common/                 # Shared utilities
│   ├── decorators/         # Custom decorators
│   ├── guards/             # Auth guards
│   ├── filters/            # Exception filters
│   └── interceptors/       # Request interceptors
│
├── auth/                   # Authentication
├── supabase/               # Supabase client
├── gemini/                 # Gemini AI service
├── openrouter/             # OpenRouter AI service
│
├── user-profile/           # User management
├── kurikulum/              # Kurikulum master data
├── jenjang/                # Jenjang pendidikan
├── mata-pelajaran/         # Mata pelajaran
│
├── capaian-pembelajaran/   # CP module
├── atp/                    # ATP module
├── tujuan-pembelajaran/    # TP module
│
├── rpp/                    # RPP generation
├── silabus/                # Silabus generation
├── modul-ajar/             # Modul ajar
├── lkpd/                   # LKPD module
├── kegiatan/               # Kegiatan pembelajaran
│
├── materi/                 # Materi pembelajaran
├── media/                  # Media pembelajaran
├── bahan-ajar/             # Bahan ajar
│
├── bank-soal/              # Bank soal
├── asesmen/                # Asesmen
├── kisi-kisi/              # Kisi-kisi soal
├── rubrik/                 # Rubrik penilaian
│
└── export/                 # Export PDF/DOCX
```

## 📁 Module Structure

Setiap module mengikuti struktur standar:

```
module-name/
├── dto/                    # Data Transfer Objects
│   └── module-name.dto.ts
├── module-name.controller.ts
├── module-name.service.ts
└── module-name.module.ts
```

## 📁 Database Structure

```
db/
├── migrations/
│   └── 001_initial_schema.sql  # Complete schema
└── README.md                   # Database docs
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-profile.service.ts` |
| Classes | PascalCase | `UserProfileService` |
| Methods | camelCase | `findAll()` |
| Variables | camelCase | `userId` |
| Constants | UPPER_SNAKE | `MAX_LIMIT` |
| Interfaces | IPascalCase | `IUserData` |
