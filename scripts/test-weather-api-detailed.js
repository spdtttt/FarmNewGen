/**
 * สคริปต์ทดสอบ Weather API แบบละเอียด
 * รัน: node scripts/test-weather-api-detailed.js
 */

require('dotenv').config();

const API_KEY = process.env.OPENWEATHER_API_KEY || 'a81a3e1d722b1be39e9e1cbee2a0627f';

console.log('🔍 กำลังทดสอบ Weather API แบบละเอียด...\n');
console.log('API Key:', API_KEY.substring(0, 8) + '...' + API_KEY.substring(API_KEY.length - 4));
console.log('API Key Length:', API_KEY.length);
console.log('');

// ทดสอบหลาย endpoints
const tests = [
  {
    name: 'Current Weather by Coordinates',
    url: `https://api.openweathermap.org/data/2.5/weather?lat=13.7563&lon=100.5018&appid=${API_KEY}&units=metric&lang=th`,
  },
  {
    name: 'Current Weather by City',
    url: `https://api.openweathermap.org/data/2.5/weather?q=Bangkok&appid=${API_KEY}&units=metric&lang=th`,
  },
  {
    name: 'Current Weather (no lang)',
    url: `https://api.openweathermap.org/data/2.5/weather?q=Bangkok&appid=${API_KEY}&units=metric`,
  },
  {
    name: 'Current Weather (standard units)',
    url: `https://api.openweathermap.org/data/2.5/weather?q=Bangkok&appid=${API_KEY}`,
  },
];

async function testEndpoint(test) {
  console.log(`🧪 ทดสอบ: ${test.name}`);
  console.log(`   URL: ${test.url.replace(API_KEY, '***')}`);
  
  try {
    const response = await fetch(test.url);
    const data = await response.json();
    
    if (response.ok && data.cod === 200) {
      console.log(`   ✅ สำเร็จ!`);
      console.log(`   เมือง: ${data.name}`);
      console.log(`   อุณหภูมิ: ${Math.round(data.main.temp)}°C`);
      console.log(`   สภาพอากาศ: ${data.weather[0].description}`);
      return true;
    } else {
      console.log(`   ❌ Error: ${data.cod || response.status}`);
      console.log(`   Message: ${data.message || 'Unknown error'}`);
      
      if (data.message?.includes('Invalid API key')) {
        console.log(`   💡 API key ไม่ถูกต้องหรือยังไม่ activate`);
      } else if (data.message?.includes('Please note')) {
        console.log(`   💡 ต้อง subscribe หรือ activate API key`);
      }
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Network Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  let successCount = 0;
  
  for (const test of tests) {
    const success = await testEndpoint(test);
    if (success) successCount++;
    console.log('');
    
    // รอ 1 วินาทีระหว่าง requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('='.repeat(50));
  console.log(`ผลลัพธ์: ${successCount}/${tests.length} ผ่าน`);
  
  if (successCount === 0) {
    console.log('\n❌ API key ไม่ทำงานเลย');
    console.log('\n💡 วิธีแก้ไข:');
    console.log('   1. ไปที่ https://home.openweathermap.org/api_keys');
    console.log('   2. ตรวจสอบว่า API key ยัง active อยู่');
    console.log('   3. ตรวจสอบว่า email ถูก verify แล้ว');
    console.log('   4. ลองสร้าง API key ใหม่');
    console.log('   5. รอ 10-15 นาที หลังจากสร้าง API key');
    console.log('   6. ตรวจสอบว่า account ไม่มีปัญหา');
    console.log('\n⚠️  หมายเหตุ:');
    console.log('   - API key ใหม่ต้องรอ 10-15 นาที ถึงจะใช้งานได้');
    console.log('   - ต้อง verify email ก่อนถึงจะใช้ API ได้');
    console.log('   - บางครั้งต้อง logout และ login ใหม่');
  } else {
    console.log('\n✅ API key ทำงานได้!');
  }
}

runTests();


