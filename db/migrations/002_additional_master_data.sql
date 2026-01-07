-- ============================================
-- ADDITIONAL MASTER DATA TABLES
-- Migration: 002_additional_master_data.sql
-- Created: 2026-01-07
-- ============================================

-- Kelas Table
CREATE TABLE IF NOT EXISTS kelas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  kode TEXT UNIQUE,
  jenjang TEXT,
  urutan INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Semester Table
CREATE TABLE IF NOT EXISTS semester (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  kode TEXT UNIQUE,
  urutan INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kompetensi Dasar Table
CREATE TABLE IF NOT EXISTS kompetensi_dasar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
  kode TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  kelas TEXT,
  aspek TEXT, -- Pengetahuan / Keterampilan
  indikator JSONB, -- Array of indicators
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_kelas_jenjang ON kelas(jenjang);
CREATE INDEX IF NOT EXISTS idx_kd_mapel_id ON kompetensi_dasar(mapel_id);
CREATE INDEX IF NOT EXISTS idx_kd_kelas ON kompetensi_dasar(kelas);

-- ============================================
-- SEED DATA
-- ============================================

-- Seed Kelas
INSERT INTO kelas (nama, kode, jenjang, urutan) VALUES
  ('1', '1', 'SD', 1),
  ('2', '2', 'SD', 2),
  ('3', '3', 'SD', 3),
  ('4', '4', 'SD', 4),
  ('5', '5', 'SD', 5),
  ('6', '6', 'SD', 6),
  ('7', '7', 'SMP', 7),
  ('8', '8', 'SMP', 8),
  ('9', '9', 'SMP', 9),
  ('X', '10', 'SMA', 10),
  ('XI', '11', 'SMA', 11),
  ('XII', '12', 'SMA', 12)
ON CONFLICT (kode) DO NOTHING;

-- Seed Semester
INSERT INTO semester (nama, kode, urutan) VALUES
  ('Ganjil', '1', 1),
  ('Genap', '2', 2)
ON CONFLICT (kode) DO NOTHING;
