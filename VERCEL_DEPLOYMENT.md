# Hướng Dẫn Deploy Lên Vercel

## 📋 Tổng Quan

Dự án Gimme-Idea cần deploy **2 projects riêng biệt** trên Vercel:
1. **Frontend (Next.js)** - `Frontend/gimme-idea-tsx/`
2. **Backend (Node.js API)** - `server/`

---

## 🎯 Deploy Frontend (Next.js)

### Bước 1: Tạo Project Trên Vercel

1. Đăng nhập [Vercel Dashboard](https://vercel.com)
2. Click **"Add New Project"**
3. Import repository từ GitHub
4. Chọn **root directory**: `Frontend/gimme-idea-tsx`

### Bước 2: Framework Preset & Build Settings

**Vercel sẽ tự động detect:**
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

Hoặc config thủ công:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### Bước 3: Environment Variables

Thêm trong **Vercel Dashboard → Settings → Environment Variables:**

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.vercel.app/api` | Production |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5001/api` | Development |

**Lưu ý:**
- `NEXT_PUBLIC_*` variables được expose ra client-side
- Đợi deploy backend xong mới có URL backend

### Bước 4: Deploy

1. Click **"Deploy"**
2. Đợi build (~2-3 phút)
3. Lấy URL: `https://gimme-idea-frontend.vercel.app`

---

## 🖥️ Deploy Backend (Node.js API)

### Bước 1: Chuẩn Bị Database (PostgreSQL)

**Khuyến nghị sử dụng Neon hoặc Supabase (Free tier):**

#### Option 1: Neon (Recommended)
1. Đăng ký tại [neon.tech](https://neon.tech)
2. Tạo database mới
3. Lấy connection string:
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/gimme_idea?sslmode=require
   ```

#### Option 2: Supabase
1. Đăng ký tại [supabase.com](https://supabase.com)
2. Tạo project mới
3. Settings → Database → Connection string (Direct connection)

### Bước 2: Tạo Project Trên Vercel

1. Vercel Dashboard → **"Add New Project"**
2. Import repository
3. Chọn **root directory**: `server`

### Bước 3: Framework Preset & Build Settings

**Manual Configuration Required:**

```json
{
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
```

**Build Settings:**
- **Framework Preset:** Other
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install && npx prisma generate`

### Bước 4: Environment Variables

Thêm trong **Settings → Environment Variables:**

| Key | Value | Required |
|-----|-------|----------|
| `NODE_ENV` | `production` | ✅ Yes |
| `DATABASE_URL` | `postgresql://...` | ✅ Yes |
| `JWT_SECRET` | `your-super-secret-key-min-32-chars` | ✅ Yes |
| `JWT_REFRESH_SECRET` | `another-secret-key-for-refresh` | ✅ Yes |
| `CLIENT_URL` | `https://gimme-idea-frontend.vercel.app` | ✅ Yes |
| `SENDGRID_API_KEY` | `SG.xxx` | ⚠️ Optional (email) |
| `SENDGRID_FROM_EMAIL` | `noreply@yourdomain.com` | ⚠️ Optional |
| `SENDGRID_FROM_NAME` | `Gimme Idea` | ⚠️ Optional |

**Tạo JWT Secrets:**
```bash
# On Mac/Linux
openssl rand -base64 32
# Hoặc
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Bước 5: Deploy & Chạy Migrations

1. Click **"Deploy"**
2. Đợi build (~3-4 phút)

**Sau khi deploy thành công, chạy Prisma migrations:**

```bash
# Clone repo về local
git clone <your-repo>
cd server

# Cài đặt dependencies
npm install

# Set DATABASE_URL từ Neon/Supabase
export DATABASE_URL="postgresql://..."

# Chạy migrations
npx prisma migrate deploy

# Seed initial data (nếu cần)
npx prisma db seed
```

**Hoặc dùng Vercel CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
cd server
vercel link

# Chạy command trên production
vercel exec "npx prisma migrate deploy"
```

### Bước 6: Lấy Backend URL

Sau khi deploy xong:
- URL: `https://gimme-idea-backend.vercel.app`
- API endpoint: `https://gimme-idea-backend.vercel.app/api`

---

## 🔗 Kết Nối Frontend ↔ Backend

### Cập Nhật Frontend Environment Variable

1. Vào **Frontend Project** → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL`:
   ```
   https://gimme-idea-backend.vercel.app/api
   ```
3. Redeploy frontend

### Cập Nhật Backend CORS

1. Vào **Backend Project** → Settings → Environment Variables
2. Update `CLIENT_URL`:
   ```
   https://gimme-idea-frontend.vercel.app
   ```
3. Redeploy backend

---

## ✅ Verification Checklist

### Frontend
- [ ] Build thành công
- [ ] Truy cập được homepage
- [ ] Console không có lỗi CORS
- [ ] API calls đến backend thành công

### Backend
- [ ] Build thành công
- [ ] Health check endpoint: `GET /health` → 200 OK
- [ ] Database connection OK
- [ ] CORS allow frontend domain
- [ ] JWT authentication hoạt động

**Test Commands:**
```bash
# Test backend health
curl https://gimme-idea-backend.vercel.app/health

# Test registration (should return 400 with validation errors or 201 success)
curl -X POST https://gimme-idea-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@#","username":"testuser"}'
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Module not found" trên Vercel

**Nguyên nhân:** Dependencies không được install đầy đủ

**Giải pháp:**
```bash
# Đảm bảo tất cả dependencies trong package.json
npm install --save <missing-package>

# Commit và push
git add package.json package-lock.json
git commit -m "Add missing dependencies"
git push
```

### Issue 2: Prisma Client Error

**Nguyên nhân:** Prisma client không được generate

**Giải pháp:** Update install command:
```json
{
  "installCommand": "npm install && npx prisma generate"
}
```

### Issue 3: CORS Errors

**Nguyên nhân:** `CLIENT_URL` không đúng hoặc thiếu

**Giải pháp:**
1. Check backend env variable `CLIENT_URL`
2. Phải match chính xác URL frontend (không có trailing slash)
3. Redeploy backend sau khi update

### Issue 4: Database Connection Timeout

**Nguyên nhân:** Connection string sai hoặc database không allow connections

**Giải pháp:**
1. Verify DATABASE_URL format
2. Neon/Supabase: Enable connection pooling
3. Add `?sslmode=require` vào connection string

### Issue 5: Environment Variables Không Load

**Nguyên nhân:** Build cache cũ

**Giải pháp:**
1. Settings → Clear Cache
2. Redeploy
3. Hoặc push new commit to force rebuild

---

## 📊 Deployment Settings Tóm Tắt

### Frontend (Next.js)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://your-backend.vercel.app/api"
  }
}
```

### Backend (Node.js)
```json
{
  "version": 2,
  "builds": [{ "src": "dist/server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "dist/server.js" }],
  "buildCommand": "npm run build",
  "installCommand": "npm install && npx prisma generate",
  "outputDirectory": "dist",
  "env": {
    "NODE_ENV": "production",
    "DATABASE_URL": "@database-url",
    "JWT_SECRET": "@jwt-secret",
    "CLIENT_URL": "@client-url"
  }
}
```

---

## 🎯 Production Checklist

Trước khi launch:

- [ ] Đổi JWT secrets (không dùng secrets trong .env.example)
- [ ] Setup SendGrid với verified domain
- [ ] Test full user flow: register → verify email → login → create project → feedback
- [ ] Setup custom domain (optional)
- [ ] Enable Vercel Analytics
- [ ] Setup error monitoring (Sentry)
- [ ] Configure rate limiting cho production
- [ ] Backup database strategy

---

## 📞 Support

Nếu gặp vấn đề:
1. Check Vercel deployment logs: Project → Deployments → [Latest] → Build Logs
2. Check runtime logs: Project → Deployments → [Latest] → Function Logs
3. Verify environment variables được load đúng

---

**Generated:** 2025-10-19
**Last Updated:** 2025-10-19
