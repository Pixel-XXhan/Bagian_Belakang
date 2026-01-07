# Database Schema

Struktur lengkap database RPP Generator.

## Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase managed)
└────────┬────────┘
         │ 1
         │
         │ n
┌────────┴────────┐        ┌─────────────────┐
│   user_profile  │        │    kurikulum    │
└─────────────────┘        └────────┬────────┘
                                    │ 1
                                    │
                                    │ n
         ┌──────────────────────────┴─────────────────┐
         │                                            │
         ▼                                            ▼
┌─────────────────┐        ┌─────────────────┐  ┌───────────┐
│ mata_pelajaran  │        │     jenjang     │  │   fase    │
└────────┬────────┘        └─────────────────┘  └───────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐ ┌─────────┐ ┌───────┐ ┌────────────┐
│  rpp  │ │silabus│ │modul_ajar│ │ lkpd  │ │ bank_soal  │
└───────┘ └───────┘ └─────────┘ └───────┘ └────────────┘
```

## Core Tables

### users (Supabase Auth)
```sql
-- Managed by Supabase Auth
auth.users (
  id UUID PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMPTZ
)
```

### user_profile
```sql
CREATE TABLE user_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT,
  nip TEXT,
  sekolah TEXT,
  jenjang TEXT,
  mata_pelajaran TEXT[],
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Master Data Tables

### kurikulum
```sql
CREATE TABLE kurikulum (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  kode TEXT UNIQUE,
  deskripsi TEXT,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### jenjang
```sql
CREATE TABLE jenjang (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  kode TEXT UNIQUE,
  urutan INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### mata_pelajaran
```sql
CREATE TABLE mata_pelajaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  kode TEXT,
  jenjang_id UUID REFERENCES jenjang(id),
  kurikulum_id UUID REFERENCES kurikulum(id),
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Document Tables

### rpp
```sql
CREATE TABLE rpp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  silabus_id UUID REFERENCES silabus(id),
  mapel_id UUID REFERENCES mata_pelajaran(id),
  judul TEXT NOT NULL,
  kelas TEXT,
  materi_pokok TEXT,
  alokasi_waktu INT,
  tujuan_pembelajaran TEXT[],
  kegiatan JSONB,
  asesmen JSONB,
  konten_lengkap JSONB,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### lkpd
```sql
CREATE TABLE lkpd (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES mata_pelajaran(id),
  judul TEXT NOT NULL,
  kelas TEXT,
  kompetensi_dasar TEXT,
  tujuan_pembelajaran TEXT[],
  petunjuk TEXT,
  langkah_kegiatan TEXT[],
  soal JSONB,
  konten JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Assessment Tables

### bank_soal
```sql
CREATE TABLE bank_soal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES mata_pelajaran(id),
  tipe TEXT,
  tingkat_kesulitan TEXT,
  pertanyaan TEXT NOT NULL,
  pilihan JSONB,
  jawaban_benar TEXT,
  pembahasan TEXT,
  kd_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### rubrik_penilaian
```sql
CREATE TABLE rubrik_penilaian (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES mata_pelajaran(id),
  judul TEXT NOT NULL,
  kelas TEXT,
  jenis_penilaian TEXT,
  skala TEXT,
  kriteria JSONB,
  konten JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_rpp_user_id ON rpp(user_id);
CREATE INDEX idx_rpp_status ON rpp(status);
CREATE INDEX idx_bank_soal_tipe ON bank_soal(tipe);
CREATE INDEX idx_bank_soal_tingkat ON bank_soal(tingkat_kesulitan);
```

## Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE rpp ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_soal ENABLE ROW LEVEL SECURITY;

-- User can only access own data
CREATE POLICY "Users can access own RPP"
ON rpp FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can access own soal"
ON bank_soal FOR ALL
TO authenticated
USING (auth.uid() = user_id);
```
