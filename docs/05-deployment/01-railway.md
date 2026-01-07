# Railway Deployment

Panduan lengkap deploy ke Railway.

## Prerequisites

- Account [Railway](https://railway.app)
- GitHub repository
- Supabase project sudah aktif

## Step 1: Prepare Repository

Pastikan repository memiliki struktur:

```
├── src/
├── package.json
├── tsconfig.json
├── nest-cli.json
└── Procfile (optional)
```

## Step 2: Create Railway Project

1. Login ke [Railway Dashboard](https://railway.app/dashboard)
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Authorize Railway untuk akses repo
5. Select repository `rpp-generator-api`

## Step 3: Configure Environment Variables

Di Railway dashboard, buka project settings → Variables:

```env
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key

# Optional
SUPABASE_SERVICE_KEY=your-service-key
NODE_ENV=production
PORT=3001
```

## Step 4: Configure Build Settings

Railway akan auto-detect NestJS project. Verify:

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm run start:prod
```

Atau buat `Procfile`:
```
web: npm run start:prod
```

## Step 5: Deploy

1. Push code ke GitHub
2. Railway akan auto-deploy
3. Check deployment logs untuk error

## Step 6: Custom Domain (Optional)

1. Di Railway dashboard → Settings → Domains
2. Add custom domain
3. Configure DNS:
   ```
   CNAME api.yourdomain.com → your-app.railway.app
   ```

## Health Check

Setelah deploy, verify:

```bash
# Health check
curl https://your-app.railway.app/api/health

# Swagger docs
open https://your-app.railway.app/api/docs
```

## Railway.json Configuration

Buat `railway.json` untuk konfigurasi advanced:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Troubleshooting

### Error: Cannot find module '/app/dist/main'

Build tidak berjalan dengan benar:
```bash
# Pastikan postinstall atau prebuild ada di package.json
"scripts": {
  "postinstall": "npm run build"
}
```

### Error: ECONNREFUSED Supabase

- Verify SUPABASE_URL di environment variables
- Check Supabase project tidak paused

### Error: Port already in use

Railway menentukan port sendiri. Gunakan:
```typescript
const port = process.env.PORT || 3001;
```

## Auto-Deploy from Git

Railway auto-deploy saat push ke:
- `main` branch (production)
- `develop` branch (staging)

## Scaling

Railway Plans:

| Plan | RAM | CPU | Price |
|------|-----|-----|-------|
| Hobby | 512MB | Shared | $5/month |
| Pro | 8GB | 8 vCPU | Usage-based |

## CI/CD Integration

GitHub Actions example:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Railway CLI
        run: npm install -g @railway/cli
        
      - name: Deploy
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```
