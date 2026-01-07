# Capaian Pembelajaran API

Kelola dan lookup Capaian Pembelajaran Kurikulum Merdeka.

## Base URL
```
/api/v2/cp
```

## Fase
| Fase | Kelas |
|------|-------|
| A | SD Kelas 1-2 |
| B | SD Kelas 3-4 |
| C | SD Kelas 5-6 |
| D | SMP Kelas 7-9 |
| E | SMA Kelas 10 |
| F | SMA Kelas 11-12 |

## Endpoints

### Lookup CP dari Kurikulum 🤖

```http
POST /api/v2/cp/lookup
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mapel": "Matematika",
  "fase": "E"
}
```

**Response (200):**
```json
{
  "mapel": "Matematika",
  "fase": "E",
  "deskripsi_fase": "Fase E (Kelas 10 SMA)",
  "elemen": [
    {
      "nama": "Bilangan",
      "deskripsi": "Peserta didik dapat memahami...",
      "sub_elemen": ["Operasi bilangan", "Bilangan rasional"]
    }
  ],
  "ai_response": { "model": "gemini-2.5-flash" }
}
```

---

### List Saved CP

```http
GET /api/v2/cp
Authorization: Bearer <token>
```

---

### Save CP

```http
POST /api/v2/cp
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "elemen": "Bilangan",
  "fase": "E",
  "deskripsi": "...",
  "sub_elemen": ["Sub 1", "Sub 2"]
}
```

---

### Update/Delete

```http
PUT /api/v2/cp/:id
DELETE /api/v2/cp/:id
Authorization: Bearer <token>
```
