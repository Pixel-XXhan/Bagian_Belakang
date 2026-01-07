# Dokumentasi Arsitektur Backend

## Tech Stack
- **Framework**: NestJS
- **Database**: Supabase (PostgreSQL)
- **AI Engine**: Google Gemini API (Model: gemini-1.5-flash)

## Struktur Modul
1. **SupabaseModule**: Mengelola koneksi ke database dan autentikasi.
2. **AiModule**: Mengelola interaksi dengan API Google Generative AI.
3. **RppModule**: Logic bisnis inti untuk pembuatan dan penyimpanan RPP.

## Alur Kerja
1. Client mengirim permintaan ke `/rpp/generate`.
2. `RppService` menyusun prompt berdasarkan input user.
3. `AiService` mengirim prompt ke Gemini.
4. Hasil dikembalikan ke user dan disimpan ke `Supabase` (jika diaktifkan).
