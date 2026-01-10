# 🔌 Katedra API Service

> **Otak Cerdas di Balik Katedra AI.**
> Backend service enterprise-grade yang mentenagai platform edukasi AI Katedra, menangani ribuan request generate dokumen per detik dengan latensi minimal.

![NestJS](https://img.shields.io/badge/NestJS-11.0-red)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.5-blue)
![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-purple)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## ⚡ Overview

Backend ini dibangun dengan **NestJS** untuk menjamin skalabilitas dan maintainability jangka panjang. Menggunakan arsitektur modular, service ini menyediakan:
*   **AI Orchestration**: Manajemen request ke LLM (Gemini, Claude, GPT) dengan load balancing dan failover.
*   **Streaming Content**: Generasi dokumen real-time (server-sent events) untuk UX yang responsif.
*   **Robust Auth**: Integrasi aman dengan Supabase Auth (JWT guard, Role-based access).
*   **Master Data**: Pengelolaan data kurikulum kompleks (CP, ATP, Materi) yang terstruktur.

## 📦 Tech Stack

Kami tidak berkompromi soal kualitas. Stack teknologi yang digunakan adalah standar industri terbaik saat ini:

| Komponen | Teknologi | Alasan Pemilihan |
|----------|-----------|------------------|
| **Framework** | [NestJS 11](https://nestjs.com/) | Arsitektur modular, TypeScript-first, Enterprise ready. |
| **Database** | [Supabase (PostgreSQL)](https://supabase.com/) | Powerful SQL + Realtime capabilities + Auth built-in. |
| **ORM** | [Prisma](https://www.prisma.io/) | Type-safe database queries. |
| **AI SDK** | Google Generative AI | Integrasi native dengan model Gemini terbaru. |
| **Documentation** | Swagger / OpenAPI | Dokumentasi API otomatis dan interaktif. |

---

## 🚀 Quick Start (Local Development)

### Prasyarat
-   Node.js 20+
-   PostgreSQL (via Supabase local atau Docker)

### Instalasi

1.  **Clone Repository**
    ```bash
    git clone https://github.com/YourUsername/katedra-backend.git
    cd katedra-backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment**
    Copy file contoh dan sesuaikan:
    ```bash
    cp .env.example .env
    ```
    Isi kredensial Supabase dan AI API Key Anda di `.env`.

4.  **Jalankan Server**
    ```bash
    # Development Mode
    npm run start:dev
    
    # Production Mode
    npm run start:prod
    ```

5.  **Akses API**
    *   API Root: `http://localhost:3001`
    *   Swagger UI: `http://localhost:3001/api/docs`

---

## 📡 API Modules (21 Modules)

Sistem ini memiliki 21 modul aktif yang terorganisir rapi:

### 🧩 Core & AI
-   `AuthModule`: Authentication strategies.
-   `GeminiModule`: Wrapper untuk Google Gemini API.
-   `OpenRouterModule`: Integrasi Claude Opus & GPT-5.

### 📚 Curriculum & Data
-   `KurikulumModule`: Manajemen Kurikulum Merdeka.
-   `JenjangModule`: SD, SMP, SMA, SMK.
-   `MapelModule`: Matematika, Bahasa, Kejuruan.
-   `CPModule`: Capaian Pembelajaran.

### 📝 Document Generator
-   `ModulAjarModule`: Generator Modul Ajar lengkap.
-   `RPPModule`: Rencana Pelaksanaan Pembelajaran.
-   `SilabusModule`: Silabus semester.
-   `LKPDModule`: Lembar Kerja Peserta Didik.

### 📊 Assessment
-   `BankSoalModule`: Generator soal (PG/Essay) + Kunci Jawaban.
-   `AsesmenModule`: Manajemen nilai.
-   `RubrikModule`: Kriteria penilaian.

---

## 🧪 Testing

Kami menjunjung tinggi kualitas kode (walaupun unit test masih WIP 😅):

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

---

## 📦 Deployment

Project ini siap deploy kemana saja (Railway, Vercel, VPS) menggunakan Docker:

```bash
# Build Docker Image
docker build -t katedra-api .

# Run Container
docker run -p 3001:3001 --env-file .env katedra-api
```

---

## 🤝 Kontribusi

Backend Engineer? Pull Request Anda sangat kami nantikan!
Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk pedoman style guide NestJS kami.

---

## 📄 Lisensi

Hak Cipta © 2026 **Katedra AI**.
Dilisensikan di bawah [MIT License](LICENSE).

---

> *"Code is poetry written by engineers."*

Dibuat dengan ❤️ dan ☕ oleh **Tim Backend Katedra**.
