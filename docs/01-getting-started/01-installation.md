# Installation Guide

Panduan lengkap instalasi RPP Generator API.

## Prerequisites

Pastikan sudah terinstall:
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 atau **yarn** >= 1.22.0
- **Git**

## Step 1: Clone Repository

```bash
git clone https://github.com/your-org/rpp-generator-api.git
cd rpp-generator-api
```

## Step 2: Install Dependencies

```bash
# Menggunakan npm
npm install

# Atau menggunakan yarn
yarn install
```

## Step 3: Setup Environment

Copy file `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit file `.env` dengan kredensial Anda:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# JWT (opsional, Supabase akan handle)
JWT_SECRET=your-jwt-secret

# Server
PORT=3001
NODE_ENV=development
```

## Step 4: Setup Database

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Buat project baru
3. Buka SQL Editor
4. Copy dan jalankan isi file `db/migrations/001_initial_schema.sql`

## Step 5: Create Storage Bucket

Di Supabase Dashboard:
1. Buka Storage
2. Create bucket: `exports`
3. Set visibility: **Private**

## Step 6: Run Development Server

```bash
npm run start:dev
```

Server akan berjalan di `http://localhost:3001`

## Step 7: Verify Installation

Buka browser dan akses:
- API Health: `http://localhost:3001/api/health`
- Swagger Docs: `http://localhost:3001/api/docs`

## Troubleshooting

### Error: Cannot connect to Supabase

1. Pastikan `SUPABASE_URL` dan `SUPABASE_KEY` benar
2. Cek apakah project Supabase sudah aktif
3. Pastikan tidak ada firewall yang memblokir

### Error: Gemini API not working

1. Pastikan `GEMINI_API_KEY` valid
2. Cek quota API di Google AI Studio
3. Pastikan API key memiliki akses ke Gemini 2.5

### Error: Port already in use

```bash
# Kill process di port 3001
npx kill-port 3001

# Atau gunakan port lain
PORT=3002 npm run start:dev
```

## Next Steps

Lanjut ke [Configuration](./02-configuration.md) untuk konfigurasi lebih lanjut.
