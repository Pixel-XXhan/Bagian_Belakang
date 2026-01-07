-- ============================================
-- ADVANCED FEATURES TABLES
-- Migration: 003_advanced_features.sql
-- Created: 2026-01-07
-- ============================================

-- Template Library Table
CREATE TABLE IF NOT EXISTS template (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL UNIQUE,
  kategori TEXT NOT NULL, -- rpp, silabus, modul_ajar, lkpd, kisi_kisi, rubrik
  mapel TEXT,
  jenjang TEXT, -- SD, SMP, SMA, SMK
  kelas TEXT,
  deskripsi TEXT,
  konten JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_template_kategori ON template(kategori);
CREATE INDEX IF NOT EXISTS idx_template_mapel ON template(mapel);
CREATE INDEX IF NOT EXISTS idx_template_is_public ON template(is_public);
CREATE INDEX IF NOT EXISTS idx_template_is_system ON template(is_system);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE template ENABLE ROW LEVEL SECURITY;

-- Users can view public, system, or own templates
CREATE POLICY "Users can view accessible templates"
ON template FOR SELECT
USING (is_public = true OR is_system = true OR auth.uid() = user_id);

-- Users can only insert their own templates
CREATE POLICY "Users can insert own templates"
ON template FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own templates
CREATE POLICY "Users can update own templates"
ON template FOR UPDATE
USING (auth.uid() = user_id);

-- Users can only delete their own templates
CREATE POLICY "Users can delete own templates"
ON template FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- SEED DEFAULT TEMPLATES
-- ============================================

INSERT INTO template (nama, kategori, mapel, jenjang, kelas, deskripsi, is_system, is_public, konten) VALUES
(
  'RPP Matematika - Aljabar Dasar',
  'rpp',
  'Matematika',
  'SMA',
  'X',
  'Template RPP untuk materi aljabar dasar',
  true,
  true,
  '{"identitas": {"satuan_pendidikan": "[Nama Sekolah]", "mata_pelajaran": "Matematika", "kelas_semester": "X/1", "alokasi_waktu": "2 x 45 menit"}, "tujuan_pembelajaran": ["Peserta didik dapat memahami konsep variabel dan konstanta", "Peserta didik dapat menyelesaikan persamaan linear satu variabel"], "kegiatan": {"pendahuluan": ["Salam dan doa", "Apersepsi", "Motivasi"], "inti": ["Eksplorasi konsep", "Diskusi kelompok", "Latihan soal"], "penutup": ["Kesimpulan", "Refleksi", "Tugas"]}}'::jsonb
),
(
  'RPP Bahasa Indonesia - Teks Eksposisi',
  'rpp',
  'Bahasa Indonesia',
  'SMA',
  'X',
  'Template RPP untuk materi teks eksposisi',
  true,
  true,
  '{"identitas": {"satuan_pendidikan": "[Nama Sekolah]", "mata_pelajaran": "Bahasa Indonesia", "kelas_semester": "X/1", "alokasi_waktu": "2 x 45 menit"}, "tujuan_pembelajaran": ["Peserta didik dapat mengidentifikasi struktur teks eksposisi", "Peserta didik dapat menulis teks eksposisi"], "kegiatan": {"pendahuluan": ["Salam", "Apersepsi tentang teks", "Tujuan pembelajaran"], "inti": ["Membaca contoh teks", "Analisis struktur", "Menulis teks"], "penutup": ["Presentasi", "Refleksi", "Penugasan"]}}'::jsonb
),
(
  'LKPD Praktikum IPA',
  'lkpd',
  'IPA',
  'SMP',
  'VIII',
  'Template LKPD untuk praktikum IPA',
  true,
  true,
  '{"judul": "[Judul Praktikum]", "tujuan": ["Tujuan 1", "Tujuan 2"], "alat_bahan": ["Alat 1", "Bahan 1"], "langkah_kerja": ["Langkah 1", "Langkah 2", "Langkah 3"], "tabel_pengamatan": {"kolom": ["No", "Pengamatan", "Hasil"]}, "pertanyaan": ["Pertanyaan 1?", "Pertanyaan 2?"], "kesimpulan": "[Isi kesimpulan]"}'::jsonb
),
(
  'Rubrik Penilaian Presentasi',
  'rubrik',
  'Umum',
  'SMA',
  NULL,
  'Template rubrik penilaian presentasi',
  true,
  true,
  '{"jenis": "keterampilan", "skala": "1-4", "kriteria": [{"aspek": "Konten/Materi", "bobot": 30, "deskriptor": {"1": "Materi tidak sesuai topik", "2": "Materi kurang lengkap", "3": "Materi cukup lengkap", "4": "Materi sangat lengkap dan mendalam"}}, {"aspek": "Penyampaian", "bobot": 25, "deskriptor": {"1": "Tidak jelas dan terbata-bata", "2": "Kurang jelas", "3": "Cukup jelas", "4": "Sangat jelas dan lancar"}}, {"aspek": "Media/Visual", "bobot": 25, "deskriptor": {"1": "Tidak menggunakan media", "2": "Media kurang menarik", "3": "Media cukup menarik", "4": "Media sangat menarik dan informatif"}}, {"aspek": "Tanya Jawab", "bobot": 20, "deskriptor": {"1": "Tidak dapat menjawab", "2": "Jawaban kurang tepat", "3": "Jawaban cukup tepat", "4": "Jawaban sangat tepat dan mendalam"}}]}'::jsonb
)
ON CONFLICT (nama) DO NOTHING;
