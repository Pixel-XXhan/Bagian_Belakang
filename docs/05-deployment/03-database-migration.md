# Database Migration

Panduan menjalankan migration database.

## Supabase SQL Editor

### Step 1: Buka SQL Editor

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** di sidebar

### Step 2: Copy Migration Script

Copy seluruh isi file:
```
db/migrations/001_initial_schema.sql
```

### Step 3: Run Migration

1. Paste SQL di editor
2. Click **Run** atau press `Cmd/Ctrl + Enter`
3. Verify tidak ada error

### Step 4: Verify Tables

Di Supabase dashboard → Table Editor, verify tables:

```
✓ user_profile
✓ kurikulum
✓ jenjang
✓ mata_pelajaran
✓ silabus
✓ rpp
✓ modul_ajar
✓ lkpd
✓ kegiatan_pembelajaran
✓ atp
✓ tujuan_pembelajaran
✓ capaian_pembelajaran
✓ materi_pembelajaran
✓ media_pembelajaran
✓ bahan_ajar
✓ bank_soal
✓ asesmen
✓ kisi_kisi
✓ rubrik_penilaian
✓ usage_log
```

## Storage Bucket Setup

### Create Bucket

```sql
-- Atau via Supabase Dashboard → Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('exports', 'exports', false);
```

### Storage Policies

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload exports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read their own files
CREATE POLICY "Users can read own exports"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Rollback

Jika perlu rollback:

```sql
-- Drop all tables (DANGER!)
DROP TABLE IF EXISTS rpp CASCADE;
DROP TABLE IF EXISTS silabus CASCADE;
-- ... etc
```

## Migration Best Practices

1. **Always backup before migration**
2. **Test on staging first**
3. **Run during low-traffic hours**
4. **Keep migration scripts versioned**

## Local Development

Untuk development, gunakan Supabase CLI:

```bash
# Install CLI
npm install -g supabase

# Link project
supabase link --project-ref your-project-id

# Run migration
supabase db push
```
