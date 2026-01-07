# Authentication Guide

## 🔐 Stack yang Digunakan

- **Provider**: Supabase Auth
- **Method**: JWT Token
- **OAuth**: Google, Facebook

---

## 📦 Setup Supabase Client

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 🔑 Login

```typescript
// Email/Password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'guru@sekolah.id',
  password: 'password123'
})

if (data.session) {
  // Simpan token untuk API calls
  const token = data.session.access_token
}
```

---

## 📝 Register

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'guru@sekolah.id',
  password: 'password123',
  options: {
    data: {
      nama_lengkap: 'Nama Guru',
      institusi: 'SMA Negeri 1'
    }
  }
})
```

---

## 🔗 OAuth Login

```typescript
// Google
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})

// Facebook
await supabase.auth.signInWithOAuth({
  provider: 'facebook',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})
```

---

## 🔄 Refresh Token

```typescript
// Supabase handles refresh automatically
// Tapi jika perlu manual:
const { data, error } = await supabase.auth.refreshSession()
```

---

## 🚪 Logout

```typescript
await supabase.auth.signOut()
```

---

## 👤 Get Current User

```typescript
const { data: { user } } = await supabase.auth.getUser()
// user.id, user.email, user.user_metadata
```

---

## 🛡️ Protected Routes (Next.js Middleware)

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Redirect ke login jika tidak ada session
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

---

## 📡 API Call dengan Token

```typescript
// Setiap request ke backend HARUS include Authorization header
const { data: { session } } = await supabase.auth.getSession()

const response = await fetch('http://localhost:3001/api/v2/rpp', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  }
})
```

---

## ⚠️ Error Handling

| Error Code | Meaning | Action |
|------------|---------|--------|
| 401 | Token expired/invalid | Redirect ke /login |
| 403 | Forbidden | Show error message |
| 422 | Validation error | Show field errors |

```typescript
if (response.status === 401) {
  await supabase.auth.signOut()
  router.push('/login')
}
```
