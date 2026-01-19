# FarmNewGen

<img src="./assets/images/icon.png" alt="FarmNewGen logo" width="96">

แอปสำหรับเกษตรกร ช่วยคำนวณสูตรและปริมาณปุ๋ยที่เหมาะสมสำหรับพืชเศรษฐกิจ พร้อมแสดงสภาพอากาศและค้นหาร้านค้าใกล้เคียง  
(โปรเจคพัฒนาด้วย Expo + React Native + TypeScript; backend ใช้ Supabase และข้อมูลสภาพอากาศจาก OpenWeatherMap)

## สรุปฟีเจอร์หลัก
- คำนวณสูตรและปริมาณปุ๋ยตามชนิดพืช ระยะเวลา และชนิดดิน (core logic: app/utils/fertilizerLogic.ts)
- ดึงข้อมูลสภาพอากาศจาก OpenWeatherMap (app/services/weatherService.ts)
- ค้นหาร้านค้าการเกษตรใกล้เคียงและเปิดแผนที่ (app/screens/ShopScreen.tsx)
- ระบบล็อกอิน/สมัคร/รีเซ็ตรหัสผ่านผ่าน Supabase (app/contexts/AuthContext.tsx)
- ใช้งานบน Android / iOS / Web ผ่าน Expo

## Tech stack
- Expo (React Native) + TypeScript
- Supabase (Auth + storage)
- OpenWeatherMap API (สภาพอากาศ)
- Prisma (schema อยู่ที่ prisma/schema.prisma) — ใช้สำหรับฝั่ง DB / migrations (ถ้ามี backend)
- Axios สำหรับ HTTP request

---

## ก่อนเริ่ม (Requirements)
- Node.js >= 18 (แนะนำ LTS)
- npm
- Expo CLI (ไม่จำเป็นแต่แนะนำ)
- สำหรับใช้งาน API ภายนอก: บัญชี OpenWeatherMap (API key) และ Supabase project (URL + ANON key) — ถ้าใช้ Supabase ที่มีค่าใน repo ให้พิจารณาเปลี่ยนเป็นตัวแปรสิ่งแวดล้อม

---

## Quick start (พัฒนาในเครื่อง)
1. ติดตั้ง dependencies
   ```bash
   npm install
   ```

2. สร้างไฟล์ .env ที่ root ของโปรเจค (ดูตัวอย่างด้านล่าง)

3. รันแอปด้วย Expo
   ```bash
   npx expo start
   ```
   หรือ
   ```bash
   npm run android
   npm run ios
   npm run web
   ```

4. หากเปลี่ยนแปลงไฟล์ .env ให้หยุด Expo แล้วรันใหม่:
   ```bash
   npx expo start --clear
   ```

---

## ตัวอย่าง .env
ไฟล์ .env ถูกใช้โดยสคริปต์ Node (scripts) และโดยการตั้งค่าแอป — ตรวจสอบให้แน่ใจว่าไฟล์นี้อยู่ใน .gitignore

ตัวอย่าง:
```
OPENWEATHER_API_KEY=your_openweathermap_key_here
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

หมายเหตุ:
- อย่าใส่เครื่องหมาย " หรือ ' รอบค่า
- รีสตาร์ท Expo ทุกครั้งหลังแก้ไข .env

---

## การตั้งค่า OpenWeatherMap (สภาพอากาศ)
เอกสารเฉพาะ: WEATHER_API_SETUP.md  
การแก้ปัญหา: WEATHER_API_TROUBLESHOOTING.md

สั้นๆ:
- สร้าง API key ที่ https://openweathermap.org/
- ใส่ใน `OPENWEATHER_API_KEY` ใน .env
- มีสคริปต์ช่วยตรวจ: `node scripts/check-weather-api.js`

ตัวอย่างรันเช็ค:
```bash
node scripts/check-weather-api.js
```
ถ้าทำงานสำเร็จจะเห็นข้อความว่า API Key ทำงานได้

ไฟล์ที่เกี่ยวข้อง:
- app/services/weatherService.ts — วิธีอ่าน API key (Constants / manifest / hardcoded fallback)
- scripts/check-weather-api.js — สคริปต์ทดสอบจากเครื่อง

ข้อสังเกตจากโค้ด:
- app/services/weatherService.ts มี hardcodedKey เป็น fallback — ให้แทนที่ด้วยค่าใน environment หรือจัดการให้ Expo ส่งค่าไปยัง Constants.extra ผ่าน app.config.js ถ้าต้องการความปลอดภัย

---

## Supabase (Auth / Session)
ค่าเชื่อมต่ออยู่ที่: src/config/supabase.ts (ปัจจุบันมีค่า URL และ anon key ติดอยู่ในไฟล์)  
แนะนำ:
- แทนที่คีย์ด้วยตัวแปรสภาพแวดล้อมหรือใช้วิธีเก็บคีย์ที่ปลอดภัยกว่า
- เมื่อใช้ฟังก์ชันรีเซ็ตรหัสผ่าน (resetPassword) แอปจะสร้าง redirect URL ผ่าน Expo Linking:
  - AuthContext แสดงการใช้ deep link เพื่อรับ token สำหรับ recovery
  - ตรวจสอบให้แน่ใจว่า redirect URL ถูกตั้งค่าใน Supabase (ตัวอย่าง: scheme://reset-password)

สคริปต์ที่เกี่ยวข้อง:
- prisma scripts (package.json): prisma:generate, prisma:migrate, prisma:studio, prisma:db:pull, prisma:db:push
- npm script ตรวจสอบ connection: `npm run prisma:test-connection` (เรียกไฟล์ scripts/test-db-connection.js)

---

## Prisma / Database
- Prisma schema: prisma/schema.prisma
- คำสั่งที่มีให้:
  ```bash
  npm run prisma:generate
  npm run prisma:migrate
  npm run prisma:studio
  ```
- ถ้าต้องการทดสอบ connection: `npm run prisma:test-connection`

---

## Useful scripts
- Start dev: `npm start` or `npx expo start`
- Reset starter content: `npm run reset-project` (เข้าไปอ่าน scripts/reset-project.js)
- Prisma: `npm run prisma:generate`, `npm run prisma:migrate`, `npm run prisma:studio`, `npm run prisma:check-env`, `npm run prisma:test-connection`
- Weather check: `node scripts/check-weather-api.js`

---

## สถาปัตยกรรมโดยย่อ
- App entry: App.tsx — ห่อด้วย AuthProvider และโชว์ AppNavigator
- Navigation: app/navigation/*
- Contexts: app/contexts/AuthContext.tsx — Supabase signIn/signUp/reset password และ deep linking
- Services:
  - app/services/weatherService.ts — ดึงข้อมูลจาก OpenWeatherMap
  - app/services/shopService.ts — ค้นหาร้านค้า (เรียกใช้ API ภายนอกหรือ Google)
- Core domain logic:
  - app/utils/fertilizerLogic.ts — ฟังก์ชัน calculateFertilizer, รายการพืช/ดิน/เป้าหมาย
- Screens: app/screens/* (Home, FertilizerCalculator, Shop, Login, Register, Profile, ฯลฯ)

---

## ตัวอย่างการใช้ฟังก์ชันคำนวณปุ๋ย (สำหรับนักพัฒนา)
ไฟล์คำนวณ: app/utils/fertilizerLogic.ts

ตัวอย่างใน REPL / Node (หรือในโค้ด):
```ts
import { calculateFertilizer } from './app/utils/fertilizerLogic';

const res = calculateFertilizer(
  'oil_palm',            // plantType
  'production_4_plus',   // stage
  'loam',                // soil
  'yield',               // goal
  100                    // amountOfTrees
);

console.log(res);
/*
{
  formula: '16-8-24',
  quantityPerTree: ...,
  totalQuantity: ...,
  details: { baseRate: ..., soilFactor: ..., goalFactor: ... }
}
*/
```

---

## Debugging & Troubleshooting (รวบรัด)
- สภาพอากาศ error 401: ให้ตรวจสอบ OpenWeather API key, ตรวจสอบการยืนยันอีเมลในบัญชี OpenWeatherMap และรอ 10–15 นาทีหลังสร้าง key (ดู WEATHER_API_TROUBLESHOOTING.md)
- หากแอปรับค่าจาก .env ไม่ได้: หยุด Expo แล้วรัน `npx expo start --clear`
- ตรวจสอบว่าฟังก์ชัน location มี permission (HomeScreen/ShopScreen ขอ permission ก่อนเรียกตำแหน่ง)
- ถ้าการ auth ผ่านลิงก์ recovery มีปัญหา ให้ดู log ใน AuthContext และตรวจสอบ deep linking / redirect URL ใน Supabase Dashboard

---

## Contributing
- เปิด issue เพื่อรายงานบั๊กหรือเสนอฟีเจอร์
- หากจะทำ pull request:
  - อธิบายการเปลี่ยนแปลงสั้น ๆ และวิธีทดสอบ
  - อย่า commit secrets (API keys) ลง repo

---

## โครงสร้างโฟลเดอร์สำคัญ
- app/ — UI, screens, contexts, services, utils
- assets/ — รูปภาพและไอคอน
- src/config — supabase client
- prisma/ — schema.prisma
- scripts/ — สคริปต์ช่วยเหลือ (เช่น check-weather-api.js, reset-project.js)

---

## ไฟล์เอกสารเพิ่มเติมใน repo
- WEATHER_API_SETUP.md — วิธีตั้งค่า OpenWeatherMap step-by-step
- WEATHER_API_TROUBLESHOOTING.md — การแก้ปัญหา Error 401 สำหรับ API
- scripts/check-weather-api.js — สคริปต์ทดสอบ API key แบบง่าย

---

## License
ยังไม่มีไฟล์ LICENSE ใน repo — เลือก license ที่ต้องการแล้วเพิ่มไฟล์ LICENSE (เช่น MIT) หากต้องการเปิดซอร์ส

---
