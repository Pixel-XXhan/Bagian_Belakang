# Frontend Developer Guide

Dokumentasi penting untuk developer frontend Katedra.

## 📁 Daftar File

| File | Deskripsi |
|------|-----------|
| [01-routes.md](./01-routes.md) | Daftar route yang didukung backend |
| [02-authentication.md](./02-authentication.md) | Cara handle auth dengan Supabase |
| [03-api-integration.md](./03-api-integration.md) | Cara consume API endpoints |
| [04-ai-usage.md](./04-ai-usage.md) | Cara menggunakan Unified AI API |
| [05-security.md](./05-security.md) | Security best practices |
| [06-important-notes.md](./06-important-notes.md) | Hal-hal penting yang harus diperhatikan |

---

## ⚡ Quick Reference

### Base URL
```
Development: http://localhost:3001
Production: https://api.katedra.id
```

### Headers Wajib
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <access_token>"
}
```

### Response Format
```json
// Success
{ "id": "uuid", "field": "value", ... }

// Error
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```
