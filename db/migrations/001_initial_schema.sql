-- ============================================
-- RPP Generator Database Schema
-- Version: 1.0
-- Date: 2026-01-06
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STORAGE BUCKET FOR EXPORTS
-- ============================================
-- Note: Run this in Supabase Dashboard > Storage > Create new bucket
-- Bucket name: exports
-- Public: false (use signed URLs)
-- File size limit: 50MB
-- Allowed MIME types: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document

-- Alternative: Create via SQL (if you have storage admin access)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('exports', 'exports', false, 52428800, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MASTER DATA TABLES
-- ============================================

-- Kurikulum
CREATE TABLE IF NOT EXISTS kurikulum (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  tahun INT,
  deskripsi TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jenjang Pendidikan
CREATE TABLE IF NOT EXISTS jenjang (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  kode TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kelas
CREATE TABLE IF NOT EXISTS kelas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  jenjang_id UUID REFERENCES jenjang(id) ON DELETE CASCADE,
  urutan INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mata Pelajaran
CREATE TABLE IF NOT EXISTS mata_pelajaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  kode TEXT,
  jenjang_id UUID REFERENCES jenjang(id) ON DELETE SET NULL,
  kurikulum_id UUID REFERENCES kurikulum(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER DATA TABLES
-- ============================================

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nama_lengkap TEXT,
  nip TEXT,
  nuptk TEXT,
  institusi TEXT,
  jenjang_id UUID REFERENCES jenjang(id) ON DELETE SET NULL,
  mapel_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'system',
  language TEXT DEFAULT 'id',
  default_ai_model TEXT DEFAULT 'gemini-2.5-flash',
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CURRICULUM PLANNING TABLES
-- ============================================

-- Capaian Pembelajaran
CREATE TABLE IF NOT EXISTS capaian_pembelajaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
  fase TEXT,
  elemen TEXT,
  deskripsi TEXT,
  kurikulum_id UUID REFERENCES kurikulum(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATP (Alur Tujuan Pembelajaran)
CREATE TABLE IF NOT EXISTS atp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cp_id UUID REFERENCES capaian_pembelajaran(id) ON DELETE SET NULL,
  judul TEXT,
  konten JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tujuan Pembelajaran
CREATE TABLE IF NOT EXISTS tujuan_pembelajaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  atp_id UUID REFERENCES atp(id) ON DELETE CASCADE,
  deskripsi TEXT,
  alokasi_waktu INT,
  urutan INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCUMENT TABLES
-- ============================================

-- Silabus
CREATE TABLE IF NOT EXISTS silabus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
  kelas TEXT,
  semester TEXT,
  tahun_ajaran TEXT,
  konten JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RPP
CREATE TABLE IF NOT EXISTS rpp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  silabus_id UUID REFERENCES silabus(id) ON DELETE SET NULL,
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
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

-- Modul Ajar
CREATE TABLE IF NOT EXISTS modul_ajar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rpp_id UUID REFERENCES rpp(id) ON DELETE SET NULL,
  judul TEXT NOT NULL,
  profil_pelajar_pancasila TEXT[],
  sarana_prasarana TEXT[],
  target_peserta_didik TEXT,
  model_pembelajaran TEXT,
  konten JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ASSESSMENT TABLES
-- ============================================

-- Bank Soal
CREATE TABLE IF NOT EXISTS bank_soal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
  tipe TEXT,
  tingkat_kesulitan TEXT,
  pertanyaan TEXT NOT NULL,
  pilihan JSONB,
  jawaban_benar TEXT,
  pembahasan TEXT,
  kd_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asesmen
CREATE TABLE IF NOT EXISTS asesmen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  jenis TEXT,
  judul TEXT,
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
  kelas TEXT,
  soal_ids UUID[],
  rubrik JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LKPD (Lembar Kerja Peserta Didik)
CREATE TABLE IF NOT EXISTS lkpd (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
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

-- Kisi-Kisi Soal
CREATE TABLE IF NOT EXISTS kisi_kisi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
  judul TEXT NOT NULL,
  kelas TEXT,
  jenis_ujian TEXT,
  tahun_ajaran TEXT,
  kompetensi_dasar TEXT[],
  indikator_soal JSONB,
  konten JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rubrik Penilaian
CREATE TABLE IF NOT EXISTS rubrik_penilaian (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
  judul TEXT NOT NULL,
  kelas TEXT,
  jenis_penilaian TEXT,
  skala TEXT,
  kriteria JSONB,
  konten JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materi Pembelajaran
CREATE TABLE IF NOT EXISTS materi_pembelajaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
  judul TEXT NOT NULL,
  kelas TEXT,
  bab TEXT,
  ringkasan TEXT,
  konten_text TEXT,
  poin_penting TEXT[],
  kata_kunci TEXT[],
  konten JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media Pembelajaran
CREATE TABLE IF NOT EXISTS media_pembelajaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
  judul TEXT NOT NULL,
  jenis TEXT,
  deskripsi TEXT,
  url TEXT,
  file_path TEXT,
  file_size BIGINT,
  topik TEXT[],
  kelas TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tujuan Pembelajaran
CREATE TABLE IF NOT EXISTS tujuan_pembelajaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
  atp_id UUID REFERENCES atp(id) ON DELETE SET NULL,
  cp_id UUID,
  deskripsi TEXT NOT NULL,
  kelas TEXT,
  alokasi_waktu INT,
  urutan INT,
  indikator TEXT[],
  kata_kerja_operasional TEXT,
  level_kognitif TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATP (Alur Tujuan Pembelajaran)
CREATE TABLE IF NOT EXISTS atp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
  cp_id UUID,
  judul TEXT NOT NULL,
  fase TEXT,
  kelas TEXT,
  tujuan_pembelajaran JSONB,
  konten JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bahan Ajar
CREATE TABLE IF NOT EXISTS bahan_ajar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
  judul TEXT NOT NULL,
  jenis TEXT,
  kelas TEXT,
  deskripsi TEXT,
  tujuan TEXT,
  konten_text TEXT,
  file_path TEXT,
  konten JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kegiatan Pembelajaran
CREATE TABLE IF NOT EXISTS kegiatan_pembelajaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rpp_id UUID REFERENCES rpp(id) ON DELETE SET NULL,
  nama TEXT NOT NULL,
  fase TEXT,
  durasi INT,
  deskripsi TEXT,
  langkah TEXT[],
  metode TEXT,
  media TEXT[],
  urutan INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Capaian Pembelajaran
CREATE TABLE IF NOT EXISTS capaian_pembelajaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
  elemen TEXT NOT NULL,
  fase TEXT,
  deskripsi TEXT,
  sub_elemen TEXT[],
  konten JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USAGE TRACKING
-- ============================================

-- Usage Log
CREATE TABLE IF NOT EXISTS usage_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT,
  tokens_used INT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default kurikulum
INSERT INTO kurikulum (nama, tahun, deskripsi, is_active) VALUES
  ('Kurikulum Merdeka', 2022, 'Kurikulum pembelajaran yang fleksibel dan berbasis kompetensi', true),
  ('Kurikulum 2013 (K13)', 2013, 'Kurikulum berbasis pendekatan saintifik', true)
ON CONFLICT DO NOTHING;

-- Insert jenjang
INSERT INTO jenjang (nama, kode) VALUES
  ('Sekolah Dasar', 'SD'),
  ('Sekolah Menengah Pertama', 'SMP'),
  ('Sekolah Menengah Atas', 'SMA'),
  ('Sekolah Menengah Kejuruan', 'SMK')
ON CONFLICT (kode) DO NOTHING;

-- Insert sample kelas for each jenjang
DO $$
DECLARE
  sd_id UUID;
  smp_id UUID;
  sma_id UUID;
  smk_id UUID;
BEGIN
  SELECT id INTO sd_id FROM jenjang WHERE kode = 'SD';
  SELECT id INTO smp_id FROM jenjang WHERE kode = 'SMP';
  SELECT id INTO sma_id FROM jenjang WHERE kode = 'SMA';
  SELECT id INTO smk_id FROM jenjang WHERE kode = 'SMK';

  -- SD classes (1-6)
  INSERT INTO kelas (nama, jenjang_id, urutan) VALUES
    ('Kelas 1', sd_id, 1), ('Kelas 2', sd_id, 2), ('Kelas 3', sd_id, 3),
    ('Kelas 4', sd_id, 4), ('Kelas 5', sd_id, 5), ('Kelas 6', sd_id, 6)
  ON CONFLICT DO NOTHING;

  -- SMP classes (7-9)
  INSERT INTO kelas (nama, jenjang_id, urutan) VALUES
    ('Kelas 7', smp_id, 1), ('Kelas 8', smp_id, 2), ('Kelas 9', smp_id, 3)
  ON CONFLICT DO NOTHING;

  -- SMA classes (10-12)
  INSERT INTO kelas (nama, jenjang_id, urutan) VALUES
    ('Kelas 10', sma_id, 1), ('Kelas 11', sma_id, 2), ('Kelas 12', sma_id, 3)
  ON CONFLICT DO NOTHING;

  -- SMK classes (10-12)
  INSERT INTO kelas (nama, jenjang_id, urutan) VALUES
    ('Kelas 10', smk_id, 1), ('Kelas 11', smk_id, 2), ('Kelas 12', smk_id, 3)
  ON CONFLICT DO NOTHING;
END $$;

-- Insert sample mata pelajaran
DO $$
DECLARE
  sma_id UUID;
  merdeka_id UUID;
BEGIN
  SELECT id INTO sma_id FROM jenjang WHERE kode = 'SMA';
  SELECT id INTO merdeka_id FROM kurikulum WHERE nama LIKE '%Merdeka%' LIMIT 1;

  INSERT INTO mata_pelajaran (nama, kode, jenjang_id, kurikulum_id) VALUES
    ('Matematika', 'MTK', sma_id, merdeka_id),
    ('Bahasa Indonesia', 'BIND', sma_id, merdeka_id),
    ('Bahasa Inggris', 'BING', sma_id, merdeka_id),
    ('Fisika', 'FIS', sma_id, merdeka_id),
    ('Kimia', 'KIM', sma_id, merdeka_id),
    ('Biologi', 'BIO', sma_id, merdeka_id),
    ('Sejarah', 'SEJ', sma_id, merdeka_id),
    ('Geografi', 'GEO', sma_id, merdeka_id),
    ('Ekonomi', 'EKO', sma_id, merdeka_id),
    ('Sosiologi', 'SOS', sma_id, merdeka_id),
    ('Pendidikan Pancasila', 'PPKN', sma_id, merdeka_id),
    ('Informatika', 'INF', sma_id, merdeka_id),
    ('Seni Budaya', 'SENB', sma_id, merdeka_id),
    ('Pendidikan Jasmani', 'PJOK', sma_id, merdeka_id)
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- RLS POLICIES (Row Level Security)
-- ============================================

-- Enable RLS on user tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE silabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpp ENABLE ROW LEVEL SECURITY;
ALTER TABLE modul_ajar ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_soal ENABLE ROW LEVEL SECURITY;
ALTER TABLE asesmen ENABLE ROW LEVEL SECURITY;
ALTER TABLE atp ENABLE ROW LEVEL SECURITY;
ALTER TABLE tujuan_pembelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_log ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON user_profiles FOR DELETE USING (auth.uid() = user_id);

-- Create policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences" ON user_preferences FOR DELETE USING (auth.uid() = user_id);

-- Create policies for rpp
CREATE POLICY "Users can view own rpp" ON rpp FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own rpp" ON rpp FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rpp" ON rpp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own rpp" ON rpp FOR DELETE USING (auth.uid() = user_id);

-- Create policies for silabus
CREATE POLICY "Users can view own silabus" ON silabus FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own silabus" ON silabus FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own silabus" ON silabus FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own silabus" ON silabus FOR DELETE USING (auth.uid() = user_id);

-- Create policies for modul_ajar
CREATE POLICY "Users can view own modul_ajar" ON modul_ajar FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own modul_ajar" ON modul_ajar FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own modul_ajar" ON modul_ajar FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own modul_ajar" ON modul_ajar FOR DELETE USING (auth.uid() = user_id);

-- Create policies for bank_soal
CREATE POLICY "Users can view own bank_soal" ON bank_soal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own bank_soal" ON bank_soal FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bank_soal" ON bank_soal FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bank_soal" ON bank_soal FOR DELETE USING (auth.uid() = user_id);

-- Create policies for asesmen
CREATE POLICY "Users can view own asesmen" ON asesmen FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own asesmen" ON asesmen FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own asesmen" ON asesmen FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own asesmen" ON asesmen FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_rpp_user_id ON rpp(user_id);
CREATE INDEX IF NOT EXISTS idx_rpp_mapel_id ON rpp(mapel_id);
CREATE INDEX IF NOT EXISTS idx_silabus_user_id ON silabus(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_soal_user_id ON bank_soal(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_user_id ON usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_mata_pelajaran_jenjang_id ON mata_pelajaran(jenjang_id);
