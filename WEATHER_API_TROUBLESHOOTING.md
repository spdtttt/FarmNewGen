# แก้ไขปัญหา Weather API Error 401

## ปัญหา: Invalid API key (Error 401)

### สาเหตุที่เป็นไปได้:

1. **API key ยังไม่ activate** - API key ใหม่ต้องรอ 10-15 นาที
2. **API key ไม่ถูกต้อง** - ตรวจสอบว่าคัดลอกถูกต้อง
3. **Account ยังไม่ verify** - ต้อง verify email ก่อน
4. **API key หมดอายุหรือถูก disable**

## วิธีแก้ไขทีละขั้นตอน:

### ขั้นตอนที่ 1: ตรวจสอบ OpenWeatherMap Account

1. ไปที่ [OpenWeatherMap](https://openweathermap.org/)
2. Login เข้าสู่ระบบ
3. ตรวจสอบว่า:
   - Email ถูก verify แล้ว
   - Account ยัง active อยู่
   - ไม่มี warning หรือ error

### ขั้นตอนที่ 2: ตรวจสอบ API Key

1. ไปที่ [API Keys](https://home.openweathermap.org/api_keys)
2. ตรวจสอบว่า:
   - API key ยัง active อยู่ (Status: Active)
   - ไม่มี rate limit warning
   - API key ถูกสร้างแล้วอย่างน้อย 10-15 นาที

### ขั้นตอนที่ 3: ทดสอบ API Key โดยตรง

ใช้ curl หรือ browser ทดสอบ:

```bash
# ทดสอบ API key
curl "https://api.openweathermap.org/data/2.5/weather?q=Bangkok&appid=YOUR_API_KEY&units=metric"
```

หรือเปิดใน browser:
```
https://api.openweathermap.org/data/2.5/weather?q=Bangkok&appid=YOUR_API_KEY&units=metric
```

**ถ้าได้ข้อมูล JSON กลับมา = API key ถูกต้อง**
**ถ้าได้ error 401 = API key ไม่ถูกต้อง**

### ขั้นตอนที่ 4: สร้าง API Key ใหม่

1. ไปที่ [API Keys](https://home.openweathermap.org/api_keys)
2. คลิก "Create Key" หรือ "Generate"
3. ตั้งชื่อ (เช่น "FarmNewGen")
4. **รอ 10-15 นาที** ให้ API key activate
5. คัดลอก API key ใหม่

### ขั้นตอนที่ 5: อัปเดตใน .env และ App

1. อัปเดต `.env`:
   ```env
   OPENWEATHER_API_KEY=your_new_api_key_here
   ```

2. **Hardcode ใน code ชั่วคราว** (ถ้า Expo ยังไม่อ่าน env):
   - แก้ไข `app/services/weatherService.ts`
   - เปลี่ยน `hardcodedKey` เป็น API key ใหม่

3. **Restart Expo:**
   ```bash
   npx expo start --clear
   ```

### ขั้นตอนที่ 6: ตรวจสอบว่า API Key ถูกอ่าน

ดู console log ในแอป ควรเห็น:
```
=== Weather API Key Debug ===
Final API Key: Yes (length: 32, preview: 911cc6aa...)
===========================
```

## วิธีทดสอบ API Key

```bash
node scripts/check-weather-api.js
```

ควรเห็น: `✅ API Key ทำงานได้!`

## หมายเหตุสำคัญ

⚠️ **API Key ใหม่ต้องรอ 10-15 นาที ถึงจะใช้งานได้**

⚠️ **ต้อง verify email ก่อนถึงจะใช้ API ได้**

⚠️ **Free tier มี rate limit: 60 calls/minute**

## ถ้ายังไม่ได้

1. ลองสร้าง account ใหม่
2. Verify email ทันที
3. สร้าง API key ใหม่
4. รอ 15 นาที
5. ทดสอบด้วย curl ก่อน
6. ถ้า curl ทำงานได้ = API key ถูกต้อง
7. ถ้า curl ไม่ได้ = API key ยังไม่ activate หรือ account มีปัญหา


