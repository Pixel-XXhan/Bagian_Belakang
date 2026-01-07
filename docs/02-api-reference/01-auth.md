# Authentication API

Autentikasi menggunakan Supabase Auth dengan JWT.

## Base URL
```
/api/v2/auth
```

## Endpoints

### Register

Mendaftarkan user baru.

```http
POST /api/v2/auth/register
```

**Request Body:**
```json
{
  "email": "guru@sekolah.id",
  "password": "password123",
  "name": "Pak Guru"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "guru@sekolah.id"
  },
  "message": "Registration successful"
}
```

---

### Login

Login dan mendapatkan access token.

```http
POST /api/v2/auth/login
```

**Request Body:**
```json
{
  "email": "guru@sekolah.id",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "guru@sekolah.id"
  }
}
```

---

### Get Current User

Mendapatkan info user yang sedang login.

```http
GET /api/v2/auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "guru@sekolah.id",
  "email_confirmed_at": "2026-01-06T12:00:00Z"
}
```

---

### Refresh Token

Memperbarui access token yang expired.

```http
POST /api/v2/auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "access_token": "new_access_token...",
  "refresh_token": "new_refresh_token..."
}
```

---

### Logout

Logout dan invalidate token.

```http
POST /api/v2/auth/logout
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

## Error Codes

| Code | Message |
|------|---------|
| 401 | Invalid credentials |
| 422 | Email already registered |
| 400 | Invalid email format |
