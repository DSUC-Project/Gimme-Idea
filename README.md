# 🎯 Gimme Idea - Feedback Platform

Nền tảng feedback cho các dự án startup và ý tưởng sáng tạo.

## 📁 Cấu trúc dự án

```
Gimme-Idea/
├── server/              # Backend API (Express + Prisma)
├── gimme-idea-fe/      # Frontend (Next.js 15 + React 19)
└── README.md           # File này
```

---

## 🚀 Quick Start - Local Development

### 1️⃣ Backend Setup

```bash
cd server

# Install dependencies
npm install

# Setup database (Prisma)
npx prisma generate
npx prisma migrate dev

# Start backend
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5001`

### 2️⃣ Frontend Setup

```bash
cd gimme-idea-fe

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

---

## 🔧 Configuration

### Backend (.env)
File `server/.env` đã có sẵn với config local:
- Database: Neon PostgreSQL (đã setup)
- Port: 5001
- JWT secrets: đã generate

### Frontend (.env.local)
File `gimme-idea-fe/.env.local` **ĐÃ ĐƯỢC TẠO** với:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

---

## 📦 Deployment

### Backend → Render.com
Xem hướng dẫn chi tiết: [server/README.deploy.md](server/README.deploy.md)

**TL;DR:**
1. Push code lên GitHub
2. Tạo Web Service trên Render.com
3. Set environment variables
4. Deploy!

### Frontend → Vercel
Xem hướng dẫn chi tiết: [gimme-idea-fe/README.deploy.md](gimme-idea-fe/README.deploy.md)

**TL;DR:**
1. Connect GitHub repo với Vercel
2. Set `NEXT_PUBLIC_API_URL` = backend URL
3. Deploy!

---

## ✨ Features Đã Hoàn Thành

### Authentication
- ✅ Register/Login with JWT
- ✅ Auto token refresh khi hết hạn
- ✅ Role-based access (BUILDER, REVIEWER, MODERATOR)

### Projects
- ✅ Browse projects với filter (category, search)
- ✅ Create/Edit/Delete projects
- ✅ Bookmark projects
- ✅ View count tracking
- ✅ Project detail với feedback list

### Feedback
- ✅ Submit feedback on projects
- ✅ AI-generated feedback support (IdeaBot)
- ✅ Rate limiting để tránh spam
- ✅ Feedback moderation (approve/reject)

### User Profile
- ✅ Profile management
- ✅ Stats dashboard (projects, feedback, bookmarks)
- ✅ Transaction history
- ✅ Social links (LinkedIn, Twitter, GitHub)

### UI/UX
- ✅ Dark theme với purple/cyan gradient
- ✅ Glassmorphism effects
- ✅ Responsive design
- ✅ Sidebar navigation
- ✅ Loading states & error handling

---

## 🔨 Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: JWT (jsonwebtoken)
- **Validation**: Zod
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer/SendGrid
- **Rate Limiting**: express-rate-limit

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Components**: Radix UI
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Fetch API
- **Auth**: Context API + localStorage

---

## 🐛 Các vấn đề đã sửa

### ✅ Frontend không fetch được backend
**Nguyên nhân:** Thiếu file `.env.local`, API client gọi sai port
**Giải pháp:** Đã tạo `.env.local` với `NEXT_PUBLIC_API_URL=http://localhost:5001/api`

### ✅ Token hết hạn không auto refresh
**Nguyên nhân:** API client không xử lý 401 errors
**Giải pháp:** Đã thêm logic auto refresh token trong `api-client.ts`

### ✅ Thiếu file deploy
**Nguyên nhân:** Chưa có config cho Render/Vercel
**Giải pháp:** Đã tạo:
- `server/render.yaml`
- `server/Procfile`
- `server/.env.production.example`
- `gimme-idea-fe/vercel.json`
- README.deploy.md cho cả backend & frontend

---

## 📝 TODO / Features còn thiếu

### High Priority
- [ ] Email verification enforcement
- [ ] Password reset flow (UI)
- [ ] Real AI feedback generation
- [ ] Pagination cho feedback list

### Medium Priority
- [ ] Notifications system (UI + real-time)
- [ ] Earnings page implementation
- [ ] Moderation dashboard
- [ ] Following/Followers system

### Low Priority
- [ ] WebSocket for real-time updates
- [ ] Stripe payment integration
- [ ] Advanced search filters
- [ ] User reputation system

---

## 🧪 Testing

### Backend
```bash
cd server
npm test
```

### Frontend
```bash
cd gimme-idea-fe
npm run build  # Test build
npm run lint   # Check linting
```

---

## 📚 API Documentation

### Base URL
- Local: `http://localhost:5001/api`
- Production: `https://your-backend.onrender.com/api`

### Main Endpoints

**Authentication**
- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Đăng xuất

**Projects**
- `GET /projects` - Danh sách projects (with filters)
- `GET /projects/:id` - Chi tiết project
- `POST /projects` - Tạo project (BUILDER only)
- `PUT /projects/:id` - Sửa project
- `DELETE /projects/:id` - Xóa project
- `GET /projects/my/projects` - Projects của mình
- `POST /projects/:id/bookmark` - Toggle bookmark

**Feedback**
- `GET /projects/:projectId/feedback` - Feedback của project
- `POST /projects/:projectId/feedback` - Gửi feedback
- `PUT /feedback/:id` - Sửa feedback
- `DELETE /feedback/:id` - Xóa feedback

**Users**
- `GET /users/me` - Thông tin user + stats
- `PUT /users/me` - Cập nhật profile
- `GET /users/me/transactions` - Lịch sử giao dịch

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - feel free to use for your own projects!

---

## 💡 Support

Có vấn đề? Check:
1. [Backend Deployment Guide](server/README.deploy.md)
2. [Frontend Deployment Guide](gimme-idea-fe/README.deploy.md)
3. GitHub Issues

---

**Built with ❤️ for the startup community**
