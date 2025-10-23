# Backend Deployment Guide

## Phương pháp 1: Deploy lên Render.com (Khuyên dùng)

### Bước 1: Chuẩn bị
1. Tạo tài khoản tại [render.com](https://render.com)
2. Connect GitHub repository của bạn

### Bước 2: Deploy
1. Click "New +" → "Web Service"
2. Chọn repository `Gimme-Idea`
3. Cấu hình:
   - **Name**: `gimme-idea-api`
   - **Region**: Singapore (gần Việt Nam nhất)
   - **Branch**: `main` hoặc branch bạn muốn
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`

### Bước 3: Thêm Environment Variables
Vào tab "Environment" và thêm:
```
DATABASE_URL=<your-neon-db-url>
JWT_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<another-random-string>
CLIENT_URL=https://your-frontend.vercel.app
NODE_ENV=production
PORT=10000
```

**Lấy DATABASE_URL từ Neon:**
- Vào [neon.tech](https://neon.tech)
- Project của bạn → Connection string
- Copy "Pooled connection string"

### Bước 4: Deploy
- Click "Create Web Service"
- Đợi ~5 phút để build
- Lấy URL: `https://gimme-idea-api.onrender.com`

---

## Phương pháp 2: Deploy lên Railway

### Bước 1: Chuẩn bị
1. Tạo tài khoản tại [railway.app](https://railway.app)
2. Install Railway CLI (optional): `npm i -g @railway/cli`

### Bước 2: Deploy
1. Click "New Project" → "Deploy from GitHub repo"
2. Chọn repository
3. Cấu hình:
   - **Root Directory**: `server`
   - Service name: `gimme-idea-api`

### Bước 3: Environment Variables
Thêm giống như Render (xem trên)

### Bước 4: Lấy URL
- Railway sẽ tự generate domain: `https://xxx.railway.app`
- Hoặc custom domain nếu muốn

---

## Sau khi Deploy Backend

### 1. Test API
```bash
curl https://your-backend-url.onrender.com/api/health
```

Phải trả về: `{"success": true, "message": "OK"}`

### 2. Update Frontend
Cập nhật file `.env.local` trong frontend:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
```

### 3. Run Database Migrations
```bash
# Nếu chưa chạy migrations
npx prisma migrate deploy
```

---

## Troubleshooting

### Lỗi: "Build failed"
- Kiểm tra `package.json` có đầy đủ dependencies
- Chắc chắn `typescript`, `prisma` có trong dependencies (không phải devDependencies)

### Lỗi: "Database connection failed"
- Kiểm tra `DATABASE_URL` đã đúng format
- Neon DB phải bật connection pooling
- Thêm `?sslmode=require` vào cuối connection string

### Lỗi: "Port already in use"
- Render tự động set PORT, không cần lo
- Trong code đã dùng `process.env.PORT`

### API trả về CORS error
- Kiểm tra `CLIENT_URL` trong env variables
- File `app.ts` đã config CORS với `CLIENT_URL`

---

## Cost & Limits

### Render Free Plan:
- ✅ 750 giờ/tháng (đủ dùng)
- ✅ Sleep sau 15 phút không dùng
- ⚠️ Cold start ~30 giây khi wake up
- ✅ Custom domain miễn phí

### Railway Free Plan:
- ✅ $5 credit/tháng
- ✅ Không sleep
- ⚠️ Hết credit thì stop

**Khuyến nghị:** Dùng Render cho production đầu tiên vì miễn phí hoàn toàn.
