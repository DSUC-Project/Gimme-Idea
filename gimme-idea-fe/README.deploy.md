# Frontend Deployment Guide (Vercel)

## 🚀 Deploy lên Vercel (Khuyên dùng cho Next.js)

### Bước 1: Chuẩn bị
1. Tạo tài khoản tại [vercel.com](https://vercel.com)
2. Install Vercel CLI (optional):
   ```bash
   npm i -g vercel
   ```

---

## Phương pháp 1: Deploy qua Vercel Dashboard (Dễ nhất)

### Bước 1: Import Project
1. Vào [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Chọn repository `Gimme-Idea`
4. Cấu hình:
   - **Framework Preset**: Next.js
   - **Root Directory**: `gimme-idea-fe`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Bước 2: Thêm Environment Variables
Trong tab "Environment Variables", thêm:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
```

**Lưu ý:** Phải deploy backend TRƯỚC để có URL!

### Bước 3: Deploy
- Click "Deploy"
- Đợi ~2-3 phút
- Vercel sẽ cho bạn URL: `https://gimme-idea.vercel.app`

### Bước 4: Update Backend CORS
Sau khi có frontend URL, update backend `.env`:
```bash
CLIENT_URL=https://gimme-idea.vercel.app
```

Rồi redeploy backend để nhận CORS mới.

---

## Phương pháp 2: Deploy qua CLI

### Bước 1: Login
```bash
cd gimme-idea-fe
vercel login
```

### Bước 2: Deploy
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Bước 3: Set Environment
```bash
vercel env add NEXT_PUBLIC_API_URL production
# Nhập: https://your-backend-url.onrender.com/api
```

---

## Sau khi Deploy

### 1. Test Frontend
Truy cập: `https://your-frontend.vercel.app`

Kiểm tra:
- ✅ Trang chủ load được
- ✅ Login/Register hoạt động
- ✅ Dashboard hiển thị data
- ✅ Browse projects fetch từ API

### 2. Check API Connection
Mở DevTools (F12) → Network:
- API calls phải gọi đến backend URL đúng
- Response phải trả về data, không có CORS error

### 3. Custom Domain (Optional)
1. Vào Vercel Dashboard → Settings → Domains
2. Add domain: `gimmeidea.com`
3. Update DNS records theo hướng dẫn
4. Đợi ~10 phút để SSL cert được tạo

---

## Environment Variables Cần Thiết

```bash
# Required
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api

# Optional (if using analytics)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**Lưu ý quan trọng:**
- Biến phải bắt đầu với `NEXT_PUBLIC_` để Next.js expose ra client
- Không được chứa secrets (API keys, passwords) trong `NEXT_PUBLIC_*`

---

## Troubleshooting

### Lỗi: "Build failed"
```bash
# Check logs trong Vercel Dashboard → Deployments → Click vào build
# Thường do:
# 1. TypeScript errors
# 2. Missing dependencies
# 3. Import paths sai
```

**Fix:** Run build locally trước:
```bash
npm run build
```

### Lỗi: "API calls returning 404"
- Kiểm tra `NEXT_PUBLIC_API_URL` có đúng không
- URL phải có `/api` ở cuối
- Backend phải đang chạy

### Lỗi: "CORS policy blocked"
- Backend `CLIENT_URL` phải match frontend URL
- Redeploy backend sau khi update `.env`

### Lỗi: "Page not found after deployment"
- Next.js routing issue
- Check `app/` directory structure
- Xem logs: `vercel logs <deployment-url>`

---

## Auto Deploy on Git Push

Vercel tự động deploy khi:
- ✅ Push to `main` branch → Production
- ✅ Push to other branches → Preview deployment
- ✅ Pull requests → Preview URL comment

Để tắt auto deploy:
- Settings → Git → Disable "Production Deployments"

---

## Performance & Optimization

### Vercel Free Plan:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Custom domains (với SSL)
- ✅ Edge Network (CDN toàn cầu)
- ✅ Automatic HTTPS

### Tips:
1. **Image Optimization**: Next.js tự động optimize images
2. **Static Generation**: Dùng `generateStaticParams` cho các trang static
3. **Edge Functions**: Deploy API routes as Edge Functions
4. **Analytics**: Enable Web Analytics trong Settings

---

## Deployment Checklist

- [ ] Backend đã deploy và có URL
- [ ] `NEXT_PUBLIC_API_URL` đã set trong Vercel
- [ ] Backend `.env` có `CLIENT_URL` đúng
- [ ] Test login/register flow
- [ ] Test API fetch (projects, feedback, profile)
- [ ] Check responsive design
- [ ] Test trên mobile browsers
- [ ] Setup custom domain (optional)
- [ ] Enable Vercel Analytics (optional)

---

## URLs Quan Trọng

- Vercel Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

**Need help?** Check Vercel logs hoặc [Discord](https://vercel.com/discord)
