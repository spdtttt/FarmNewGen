# วิธีตั้งค่า OpenWeatherMap API

## ขั้นตอนที่ 1: สร้าง API Key

1. ไปที่ [OpenWeatherMap](https://openweathermap.org/)
2. สมัครสมาชิก (ฟรี) หรือ Login
3. ไปที่ [API Keys](https://home.openweathermap.org/api_keys)
4. คลิก "Create Key" หรือใช้ Default key ที่มีอยู่
5. คัดลอก API Key

## ขั้นตอนที่ 2: ตั้งค่าใน Environment Variables

เพิ่ม API Key ในไฟล์ `.env` ใน root directory:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

**สำคัญ:** 
- อย่าใส่เครื่องหมาย `"` หรือ `'` รอบ API key
- ตรวจสอบว่าไม่มีช่องว่างก่อนหรือหลัง API key

## ขั้นตอนที่ 3: Restart Expo

หลังจากเพิ่ม API key ใน `.env` แล้ว:

1. **หยุด Expo server** (กด `Ctrl+C` ใน terminal)
2. **รันใหม่:**
   ```bash
   npm start
   ```
   หรือ
   ```bash
   npx expo start --clear
   ```

**สำคัญ:** ต้อง restart Expo server ทุกครั้งที่แก้ไข `.env` file`

## ขั้นตอนที่ 4: ตรวจสอบว่า API Key ถูกอ่าน

เมื่อรันแอปแล้ว ตรวจสอบ console log:
- ควรเห็น: `Weather API Key loaded: Yes`
- ควรเห็น: `API Key length: 32` (หรือความยาวของ API key ของคุณ)

## วิธีแก้ปัญหา Error 401

### ปัญหา: Weather API error: 401

**สาเหตุ:**
- API key ไม่ถูกต้อง
- API key ไม่ถูกอ่านจาก environment variables
- ยังไม่ได้ restart Expo server หลังจากเพิ่ม API key

**วิธีแก้ไข:**

1. **ตรวจสอบ API key ใน .env:**
   ```bash
   cat .env | grep OPENWEATHER
   ```
   ควรเห็น: `OPENWEATHER_API_KEY=your_actual_key_here`

2. **ตรวจสอบว่า API key ถูกต้อง:**
   - ไปที่ [OpenWeatherMap API Keys](https://home.openweathermap.org/api_keys)
   - ตรวจสอบว่า key ยัง active อยู่
   - ลองสร้าง key ใหม่ถ้าจำเป็น

3. **Restart Expo server:**
   ```bash
   # หยุด server (Ctrl+C)
   npx expo start --clear
   ```

4. **ตรวจสอบ console log:**
   - ดูว่า `Weather API Key loaded: Yes`
   - ดูว่า `API Key length` ถูกต้อง (ไม่ใช่ 0)

## หมายเหตุ

- API Key ฟรีมี rate limit: 60 calls/minute, 1,000,000 calls/month
- สำหรับการใช้งานจริง ควรเก็บ API key ใน environment variables
- อย่า commit API key ลงใน git repository (ตรวจสอบว่า `.env` อยู่ใน `.gitignore`)

## ตัวอย่างการใช้งาน

แอปจะ:
1. ขอ permission เพื่อเข้าถึงตำแหน่ง
2. ดึงข้อมูลสภาพอากาศจากตำแหน่งปัจจุบัน
3. แสดงข้อมูลอุณหภูมิ, ความชื้น, ความดัน, ลม, และทัศนวิสัย

## Fallback

ถ้าไม่สามารถดึงตำแหน่งได้ แอปจะใช้ข้อมูลจากกรุงเทพเป็นค่า default
