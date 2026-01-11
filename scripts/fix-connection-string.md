# วิธีแก้ปัญหา Password Authentication Failed

## ปัญหา
Connection string ถูกต้อง แต่ password authentication failed

## วิธีแก้ไข

### ขั้นตอนที่ 1: ตรวจสอบ Connection String Format

สำหรับ **DIRECT_URL** (ใช้กับ `prisma db pull`):
```
postgresql://postgres:[PASSWORD]@db.wbprqrmvgusdhqjmyrfb.supabase.co:5432/postgres
```

**สำคัญ:**
- Username ต้องเป็น `postgres` (ไม่ใช่ `postgres.wbprqrmvgusdhqjmyrfb`)
- Port ต้องเป็น `5432`
- Host ต้องเป็น `db.wbprqrmvgusdhqjmyrfb.supabase.co` (ไม่ใช่ pooler)

### ขั้นตอนที่ 2: หา Connection String จาก Supabase

1. ไปที่ [Supabase Dashboard](https://app.supabase.com)
2. เลือกโปรเจค `wbprqrmvgusdhqjmyrfb`
3. ไปที่ **Settings** > **Database**
4. ในส่วน **Connection string**:
   - **เลือก "Direct connection"** (ไม่ใช่ Connection pooling)
   - **เลือก "URI"** format
   - คัดลอก connection string
   - **ตรวจสอบว่า username เป็น "postgres"**

### ขั้นตอนที่ 3: Reset Database Password (ถ้าจำเป็น)

1. ไปที่ Supabase Dashboard > Settings > Database
2. คลิก **Reset database password**
3. ตั้ง password ใหม่
4. คัดลอก connection string ใหม่และแทนที่ password

### ขั้นตอนที่ 4: อัปเดต .env

แก้ไขไฟล์ `.env`:

```env
# สำหรับ Prisma db pull (Direct Connection)
DIRECT_URL="postgresql://postgres:[NEW-PASSWORD]@db.wbprqrmvgusdhqjmyrfb.supabase.co:5432/postgres"

# สำหรับ Prisma Client (Connection Pooling)
DATABASE_URL="postgresql://postgres.wbprqrmvgusdhqjmyrfb:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

### ขั้นตอนที่ 5: ทดสอบอีกครั้ง

```bash
npm run prisma:test-connection
```

## ตัวอย่าง Connection String ที่ถูกต้อง

### DIRECT_URL (สำหรับ Prisma Migrate/db pull):
```
postgresql://postgres:your-password-here@db.wbprqrmvgusdhqjmyrfb.supabase.co:5432/postgres
```

### DATABASE_URL (สำหรับ Prisma Client):
```
postgresql://postgres.wbprqrmvgusdhqjmyrfb:your-password-here@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## ข้อแตกต่างระหว่าง Direct และ Pooling

- **Direct Connection**: ใช้สำหรับ migrations และ db pull
  - Username: `postgres`
  - Host: `db.[PROJECT-REF].supabase.co`
  - Port: `5432`

- **Connection Pooling**: ใช้สำหรับ Prisma Client (production)
  - Username: `postgres.[PROJECT-REF]`
  - Host: `aws-1-ap-southeast-1.pooler.supabase.com`
  - Port: `6543`
  - มี `?pgbouncer=true&connection_limit=1`


