-- ============================================
-- RPP Generator - Complete RLS & Storage Setup
-- Version: 1.1
-- Date: 2026-01-08
-- ============================================

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================

-- Create exports bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exports', 
  'exports', 
  false, 
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Create media bucket for uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media', 
  'media', 
  false, 
  104857600, -- 100MB
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'audio/mpeg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE RLS POLICIES
-- ============================================

-- Exports bucket policies
CREATE POLICY "Users can upload own exports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own exports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'exports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own exports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'exports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Media bucket policies  
CREATE POLICY "Users can upload own media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- ADD MISSING user_id COLUMNS
-- ============================================

-- Add user_id to capaian_pembelajaran if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'capaian_pembelajaran' AND column_name = 'user_id') THEN
    ALTER TABLE capaian_pembelajaran ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================
-- ENABLE RLS ON ALL USER TABLES
-- ============================================

ALTER TABLE lkpd ENABLE ROW LEVEL SECURITY;
ALTER TABLE kisi_kisi ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubrik_penilaian ENABLE ROW LEVEL SECURITY;
ALTER TABLE materi_pembelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_pembelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE kegiatan_pembelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE bahan_ajar ENABLE ROW LEVEL SECURITY;
ALTER TABLE capaian_pembelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE atp ENABLE ROW LEVEL SECURITY;
ALTER TABLE tujuan_pembelajaran ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR USER-OWNED TABLES
-- ============================================

-- LKPD policies
DROP POLICY IF EXISTS "Users can view own lkpd" ON lkpd;
DROP POLICY IF EXISTS "Users can update own lkpd" ON lkpd;
DROP POLICY IF EXISTS "Users can insert own lkpd" ON lkpd;
DROP POLICY IF EXISTS "Users can delete own lkpd" ON lkpd;
CREATE POLICY "Users can view own lkpd" ON lkpd FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own lkpd" ON lkpd FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lkpd" ON lkpd FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own lkpd" ON lkpd FOR DELETE USING (auth.uid() = user_id);

-- Kisi-kisi policies
DROP POLICY IF EXISTS "Users can view own kisi_kisi" ON kisi_kisi;
DROP POLICY IF EXISTS "Users can update own kisi_kisi" ON kisi_kisi;
DROP POLICY IF EXISTS "Users can insert own kisi_kisi" ON kisi_kisi;
DROP POLICY IF EXISTS "Users can delete own kisi_kisi" ON kisi_kisi;
CREATE POLICY "Users can view own kisi_kisi" ON kisi_kisi FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own kisi_kisi" ON kisi_kisi FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own kisi_kisi" ON kisi_kisi FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own kisi_kisi" ON kisi_kisi FOR DELETE USING (auth.uid() = user_id);

-- Rubrik policies
DROP POLICY IF EXISTS "Users can view own rubrik" ON rubrik_penilaian;
DROP POLICY IF EXISTS "Users can update own rubrik" ON rubrik_penilaian;
DROP POLICY IF EXISTS "Users can insert own rubrik" ON rubrik_penilaian;
DROP POLICY IF EXISTS "Users can delete own rubrik" ON rubrik_penilaian;
CREATE POLICY "Users can view own rubrik" ON rubrik_penilaian FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own rubrik" ON rubrik_penilaian FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rubrik" ON rubrik_penilaian FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own rubrik" ON rubrik_penilaian FOR DELETE USING (auth.uid() = user_id);

-- Materi policies
DROP POLICY IF EXISTS "Users can view own materi" ON materi_pembelajaran;
DROP POLICY IF EXISTS "Users can update own materi" ON materi_pembelajaran;
DROP POLICY IF EXISTS "Users can insert own materi" ON materi_pembelajaran;
DROP POLICY IF EXISTS "Users can delete own materi" ON materi_pembelajaran;
CREATE POLICY "Users can view own materi" ON materi_pembelajaran FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own materi" ON materi_pembelajaran FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own materi" ON materi_pembelajaran FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own materi" ON materi_pembelajaran FOR DELETE USING (auth.uid() = user_id);

-- Media policies
DROP POLICY IF EXISTS "Users can view own media" ON media_pembelajaran;
DROP POLICY IF EXISTS "Users can update own media" ON media_pembelajaran;
DROP POLICY IF EXISTS "Users can insert own media" ON media_pembelajaran;
DROP POLICY IF EXISTS "Users can delete own media" ON media_pembelajaran;
CREATE POLICY "Users can view own media" ON media_pembelajaran FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own media" ON media_pembelajaran FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own media" ON media_pembelajaran FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own media" ON media_pembelajaran FOR DELETE USING (auth.uid() = user_id);

-- Kegiatan policies
DROP POLICY IF EXISTS "Users can view own kegiatan" ON kegiatan_pembelajaran;
DROP POLICY IF EXISTS "Users can update own kegiatan" ON kegiatan_pembelajaran;
DROP POLICY IF EXISTS "Users can insert own kegiatan" ON kegiatan_pembelajaran;
DROP POLICY IF EXISTS "Users can delete own kegiatan" ON kegiatan_pembelajaran;
CREATE POLICY "Users can view own kegiatan" ON kegiatan_pembelajaran FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own kegiatan" ON kegiatan_pembelajaran FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own kegiatan" ON kegiatan_pembelajaran FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own kegiatan" ON kegiatan_pembelajaran FOR DELETE USING (auth.uid() = user_id);

-- Bahan Ajar policies
DROP POLICY IF EXISTS "Users can view own bahan_ajar" ON bahan_ajar;
DROP POLICY IF EXISTS "Users can update own bahan_ajar" ON bahan_ajar;
DROP POLICY IF EXISTS "Users can insert own bahan_ajar" ON bahan_ajar;
DROP POLICY IF EXISTS "Users can delete own bahan_ajar" ON bahan_ajar;
CREATE POLICY "Users can view own bahan_ajar" ON bahan_ajar FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own bahan_ajar" ON bahan_ajar FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bahan_ajar" ON bahan_ajar FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bahan_ajar" ON bahan_ajar FOR DELETE USING (auth.uid() = user_id);

-- Capaian Pembelajaran policies (allow view all public CP, but only edit own)
DROP POLICY IF EXISTS "Users can view cp" ON capaian_pembelajaran;
DROP POLICY IF EXISTS "Users can view own cp" ON capaian_pembelajaran;
DROP POLICY IF EXISTS "Users can update own cp" ON capaian_pembelajaran;
DROP POLICY IF EXISTS "Users can insert own cp" ON capaian_pembelajaran;
DROP POLICY IF EXISTS "Users can delete own cp" ON capaian_pembelajaran;
CREATE POLICY "Users can view cp" ON capaian_pembelajaran FOR SELECT USING (true); -- CP is public data
CREATE POLICY "Users can update own cp" ON capaian_pembelajaran FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cp" ON capaian_pembelajaran FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own cp" ON capaian_pembelajaran FOR DELETE USING (auth.uid() = user_id);

-- ATP policies  
DROP POLICY IF EXISTS "Users can view own atp" ON atp;
DROP POLICY IF EXISTS "Users can update own atp" ON atp;
DROP POLICY IF EXISTS "Users can insert own atp" ON atp;
DROP POLICY IF EXISTS "Users can delete own atp" ON atp;
CREATE POLICY "Users can view own atp" ON atp FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own atp" ON atp FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own atp" ON atp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own atp" ON atp FOR DELETE USING (auth.uid() = user_id);

-- Tujuan Pembelajaran policies
DROP POLICY IF EXISTS "Users can view own tp" ON tujuan_pembelajaran;
DROP POLICY IF EXISTS "Users can update own tp" ON tujuan_pembelajaran;
DROP POLICY IF EXISTS "Users can insert own tp" ON tujuan_pembelajaran;
DROP POLICY IF EXISTS "Users can delete own tp" ON tujuan_pembelajaran;
CREATE POLICY "Users can view own tp" ON tujuan_pembelajaran FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own tp" ON tujuan_pembelajaran FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tp" ON tujuan_pembelajaran FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own tp" ON tujuan_pembelajaran FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ADDITIONAL INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_lkpd_user_id ON lkpd(user_id);
CREATE INDEX IF NOT EXISTS idx_kisi_kisi_user_id ON kisi_kisi(user_id);
CREATE INDEX IF NOT EXISTS idx_rubrik_user_id ON rubrik_penilaian(user_id);
CREATE INDEX IF NOT EXISTS idx_materi_user_id ON materi_pembelajaran(user_id);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media_pembelajaran(user_id);
CREATE INDEX IF NOT EXISTS idx_kegiatan_user_id ON kegiatan_pembelajaran(user_id);
CREATE INDEX IF NOT EXISTS idx_bahan_ajar_user_id ON bahan_ajar(user_id);
CREATE INDEX IF NOT EXISTS idx_cp_mapel_id ON capaian_pembelajaran(mapel_id);
CREATE INDEX IF NOT EXISTS idx_atp_user_id ON atp(user_id);
CREATE INDEX IF NOT EXISTS idx_tp_user_id ON tujuan_pembelajaran(user_id);
CREATE INDEX IF NOT EXISTS idx_modul_ajar_user_id ON modul_ajar(user_id);
CREATE INDEX IF NOT EXISTS idx_asesmen_user_id ON asesmen(user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers (DROP first to avoid duplicates)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
DROP TRIGGER IF EXISTS update_rpp_updated_at ON rpp;
DROP TRIGGER IF EXISTS update_silabus_updated_at ON silabus;
DROP TRIGGER IF EXISTS update_modul_ajar_updated_at ON modul_ajar;
DROP TRIGGER IF EXISTS update_lkpd_updated_at ON lkpd;
DROP TRIGGER IF EXISTS update_kisi_kisi_updated_at ON kisi_kisi;
DROP TRIGGER IF EXISTS update_rubrik_updated_at ON rubrik_penilaian;
DROP TRIGGER IF EXISTS update_materi_updated_at ON materi_pembelajaran;
DROP TRIGGER IF EXISTS update_media_updated_at ON media_pembelajaran;
DROP TRIGGER IF EXISTS update_kegiatan_updated_at ON kegiatan_pembelajaran;
DROP TRIGGER IF EXISTS update_bahan_ajar_updated_at ON bahan_ajar;
DROP TRIGGER IF EXISTS update_atp_updated_at ON atp;
DROP TRIGGER IF EXISTS update_tp_updated_at ON tujuan_pembelajaran;
DROP TRIGGER IF EXISTS update_cp_updated_at ON capaian_pembelajaran;
DROP TRIGGER IF EXISTS update_asesmen_updated_at ON asesmen;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rpp_updated_at BEFORE UPDATE ON rpp FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_silabus_updated_at BEFORE UPDATE ON silabus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modul_ajar_updated_at BEFORE UPDATE ON modul_ajar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lkpd_updated_at BEFORE UPDATE ON lkpd FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kisi_kisi_updated_at BEFORE UPDATE ON kisi_kisi FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rubrik_updated_at BEFORE UPDATE ON rubrik_penilaian FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materi_updated_at BEFORE UPDATE ON materi_pembelajaran FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media_pembelajaran FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kegiatan_updated_at BEFORE UPDATE ON kegiatan_pembelajaran FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bahan_ajar_updated_at BEFORE UPDATE ON bahan_ajar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_atp_updated_at BEFORE UPDATE ON atp FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tp_updated_at BEFORE UPDATE ON tujuan_pembelajaran FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cp_updated_at BEFORE UPDATE ON capaian_pembelajaran FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asesmen_updated_at BEFORE UPDATE ON asesmen FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
