# ⚠️ DATABASE SETUP NEEDED

## Vấn đề:
Không thể kết nối với Supabase database để chạy migrations.

## Cần làm gì:

### 1. Kiểm tra Supabase Project
```
https://supabase.com/dashboard
```

- Vào project: negjhshfqvgmpuonfpdc
- Check xem project có đang **active** không (không bị paused)
- Nếu paused → Click "Resume project"

### 2. Lấy Connection String đúng

Vào **Settings → Database → Connection string**

Copy **"Connection pooling"** string:
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

Hoặc **"Direct connection"** (tốt hơn cho migrations):
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

⚠️ **LƯU Ý:** Nếu password có ký tự đặc biệt (@, #, etc), cần URL-encode:
- `@` → `%40`
- `#` → `%23`
- Etc.

Example: `Zahs@2025` → `Zahs%402025`

### 3. Update GMI-BE/.env

```env
DATABASE_URL="postgresql://postgres:[ENCODED-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 4. Chạy migrations

```bash
cd GMI-BE
npm run prisma:migrate
```

Nếu thành công, bạn sẽ thấy:
```
✔ Generated Prisma Client
✔ Applying migration `20XX_init`
```

---

## Alternative: Chạy migrations thủ công

Nếu vẫn lỗi, bạn có thể tạo tables manually trong Supabase SQL Editor:

```sql
-- Copy từ prisma/migrations/xxx_init/migration.sql
-- và run trong Supabase Dashboard → SQL Editor
```

---

## Status hiện tại:

✅ Prisma Client đã được generate
✅ Schema đã sẵn sàng
⏳ Migrations chưa chạy (cần database connection)

**Project vẫn có thể chạy**, nhưng sẽ bị lỗi khi gọi API do chưa có tables.
