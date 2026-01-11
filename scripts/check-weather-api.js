/**
 * สคริปต์ตรวจสอบ Weather API Key
 * รัน: node scripts/check-weather-api.js
 */

require('dotenv').config();

console.log('🔍 กำลังตรวจสอบ Weather API Key...\n');

const apiKey = process.env.OPENWEATHER_API_KEY;

if (!apiKey) {
  console.error('❌ OPENWEATHER_API_KEY ไม่พบใน .env');
  console.log('\n💡 แนะนำ:');
  console.log('   1. ตรวจสอบว่าไฟล์ .env มี OPENWEATHER_API_KEY');
  console.log('   2. ตรวจสอบว่าไม่มีช่องว่างก่อนหรือหลัง =');
  console.log('   3. ตรวจสอบว่าไม่มีเครื่องหมาย " หรือ \' รอบ API key\n');
  process.exit(1);
}

console.log('✅ OPENWEATHER_API_KEY พบแล้ว');
console.log(`   ความยาว: ${apiKey.length} ตัวอักษร`);
console.log(`   Preview: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}\n`);

// ทดสอบ API key
console.log('🧪 กำลังทดสอบ API key...\n');

const testUrl = `https://api.openweathermap.org/data/2.5/weather?q=Bangkok&appid=${apiKey}&units=metric`;

fetch(testUrl)
  .then(async (response) => {
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Key ทำงานได้!');
      console.log(`   เมืองทดสอบ: ${data.name}`);
      console.log(`   อุณหภูมิ: ${Math.round(data.main.temp)}°C\n`);
    } else {
      const errorText = await response.text();
      console.error(`❌ API Key ไม่ถูกต้อง (Error ${response.status})`);
      console.error(`   Response: ${errorText}\n`);
      console.log('💡 แนะนำ:');
      console.log('   1. ตรวจสอบว่า API key ถูกต้องที่ https://home.openweathermap.org/api_keys');
      console.log('   2. ตรวจสอบว่า API key ยัง active อยู่');
      console.log('   3. ลองสร้าง API key ใหม่\n');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ ไม่สามารถเชื่อมต่อ API ได้');
    console.error(`   Error: ${error.message}\n`);
    console.log('💡 แนะนำ:');
    console.log('   1. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
    console.log('   2. ตรวจสอบว่า OpenWeatherMap API ยังใช้งานได้\n');
    process.exit(1);
  });


