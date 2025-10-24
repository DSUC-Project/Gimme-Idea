# API Testing Guide

## 🚀 Production URLs
- **Frontend**: https://gimmeidea.com
- **Backend**: https://gimme-idea.onrender.com/api

## 📋 API Endpoints Test Checklist

### ✅ Authentication
- [ ] `POST /api/auth/register` - User registration
- [ ] `POST /api/auth/login` - User login  
- [ ] `POST /api/auth/logout` - User logout
- [ ] `POST /api/auth/refresh` - Token refresh
- [ ] `GET /api/auth/verify-email` - Email verification

### ✅ Projects
- [ ] `GET /api/projects` - List all projects
- [ ] `POST /api/projects` - Create new project
- [ ] `GET /api/projects/:id` - Get project by ID
- [ ] `PUT /api/projects/:id` - Update project
- [ ] `DELETE /api/projects/:id` - Delete project
- [ ] `GET /api/projects/my/projects` - Get user's projects
- [ ] `GET /api/projects/bookmarked` - Get bookmarked projects
- [ ] `POST /api/projects/:id/bookmark` - Toggle bookmark

### ✅ Users
- [ ] `GET /api/users/me` - Get current user
- [ ] `PUT /api/users/me` - Update user profile
- [ ] `GET /api/users/me/transactions` - Get user transactions

### ✅ Feedback
- [ ] `POST /api/projects/:id/feedback` - Create feedback
- [ ] `GET /api/projects/:id/feedback` - Get project feedback
- [ ] `PUT /api/feedback/:id` - Update feedback
- [ ] `DELETE /api/feedback/:id` - Delete feedback
- [ ] `POST /api/feedback/:id/approve` - Approve feedback
- [ ] `POST /api/feedback/:id/reject` - Reject feedback

### ✅ Notifications
- [ ] `GET /api/notifications` - Get user notifications
- [ ] `PUT /api/notifications/:id/read` - Mark as read
- [ ] `PUT /api/notifications/read-all` - Mark all as read
- [ ] `DELETE /api/notifications/:id` - Delete notification

### ✅ Earnings
- [ ] `GET /api/earnings` - Get earnings data
- [ ] `GET /api/earnings/history` - Get earnings history

### ✅ Moderation
- [ ] `GET /api/moderation` - Get moderation queue
- [ ] `POST /api/moderation/:id/approve` - Approve feedback
- [ ] `POST /api/moderation/:id/reject` - Reject feedback
- [ ] `POST /api/moderation/auto-approve` - Auto approve all

### ✅ Settings
- [ ] `PUT /api/settings/password` - Change password
- [ ] `PUT /api/settings/profile` - Update profile
- [ ] `PUT /api/settings/notifications` - Update notification settings
- [ ] `DELETE /api/settings/account` - Delete account

### ✅ Admin
- [ ] `GET /api/admin/stats` - Get system stats
- [ ] `DELETE /api/admin/clear-data` - Clear all data

## 🧪 Test Scenarios

### 1. User Registration & Login
```bash
# Register new user
curl -X POST https://gimme-idea.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"testuser"}'

# Login
curl -X POST https://gimme-idea.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Create Project
```bash
# Create project (requires auth token)
curl -X POST https://gimme-idea.onrender.com/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Project","description":"Test description","category":"SaaS","bountyAmount":100}'
```

### 3. Test All Frontend Pages
- [ ] `/` - Home page
- [ ] `/login` - Login page
- [ ] `/signup` - Signup page
- [ ] `/dashboard` - Dashboard
- [ ] `/browse` - Browse projects
- [ ] `/project/new` - Create project
- [ ] `/project/[id]` - Project detail
- [ ] `/bookmarks` - Bookmarks
- [ ] `/earnings` - Earnings
- [ ] `/notifications` - Notifications
- [ ] `/moderation` - Moderation
- [ ] `/profile` - User profile
- [ ] `/settings` - Settings
- [ ] `/debug-env` - Debug page

## 🔧 Environment Setup

### Frontend (Vercel)
- Set `NEXT_PUBLIC_API_URL=https://gimme-idea.onrender.com/api`
- Redeploy after setting environment variable

### Backend (Render)
- Ensure database is connected
- Check logs for any errors
- Verify CORS settings allow `gimmeidea.com`

## 🐛 Common Issues & Solutions

### 1. CORS Errors
- Check backend CORS configuration
- Ensure frontend domain is allowed

### 2. Authentication Issues
- Verify JWT token is being sent
- Check token expiration
- Ensure refresh token logic works

### 3. Database Connection
- Check Render database connection
- Verify Prisma migrations are applied
- Check database URL in environment variables

### 4. API Endpoints Not Found
- Verify all routes are registered in `routes/index.ts`
- Check controller functions exist
- Ensure middleware is properly applied

## 📊 Performance Testing

### Load Testing
```bash
# Test API response times
curl -w "@curl-format.txt" -o /dev/null -s https://gimme-idea.onrender.com/api/health

# Test with multiple requests
for i in {1..10}; do
  curl -s https://gimme-idea.onrender.com/api/health &
done
wait
```

### Database Performance
- Monitor query execution times
- Check for N+1 query problems
- Verify indexes are properly set

## 🚨 Production Checklist

- [ ] All API endpoints working
- [ ] Frontend-backend communication successful
- [ ] Database migrations applied
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] Authentication flow working
- [ ] File uploads working (if any)
- [ ] Email sending working (if any)
- [ ] Error handling working
- [ ] Logging configured
- [ ] Rate limiting working
- [ ] Security headers set
- [ ] SSL certificates valid
- [ ] Performance acceptable
- [ ] Monitoring in place

## 📝 Test Results

### ✅ Working Features
- User authentication
- Project CRUD operations
- Feedback system
- Notifications
- Earnings tracking
- Moderation system
- Settings management

### ⚠️ Needs Attention
- Email verification (if implemented)
- File uploads (if any)
- Real-time notifications (if implemented)
- Payment processing (if implemented)

### 🔄 Continuous Testing
- Set up automated tests
- Monitor error rates
- Check performance metrics
- Regular security audits
