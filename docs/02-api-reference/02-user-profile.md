# User Profile API

Kelola profil dan preferensi pengguna.

## Base URL
```
/api/v2/user-profile
```

## Endpoints

### Get My Profile

```http
GET /api/v2/user-profile/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "nama": "Pak Guru",
  "nip": "1234567890",
  "sekolah": "SMA Negeri 1",
  "jenjang": "SMA",
  "mata_pelajaran": ["Matematika", "Fisika"],
  "preferences": {
    "theme": "dark",
    "default_kurikulum": "Kurikulum Merdeka"
  }
}
```

---

### Update Profile

```http
PUT /api/v2/user-profile/me
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "nama": "Pak Guru Updated",
  "sekolah": "SMA Negeri 2",
  "mata_pelajaran": ["Matematika"]
}
```

---

### Update Preferences

```http
PATCH /api/v2/user-profile/preferences
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "theme": "light",
  "default_kurikulum": "Kurikulum 2013"
}
```
