/**
 * สคริปต์ตรวจสอบ Prisma Environment Variables
 * รัน: node scripts/check-prisma-env.js
 */

require('dotenv').config();

console.log('🔍 กำลังตรวจสอบ Prisma Environment Variables...\n');

const directUrl = process.env.DIRECT_URL;
const databaseUrl = process.env.DATABASE_URL;

// ตรวจสอบ DIRECT_URL
if (!directUrl) {
  console.error('❌ DIRECT_URL ไม่พบใน .env');
  console.log('   ต้องเพิ่ม DIRECT_URL สำหรับ Prisma Migrate และ db pull\n');
} else {
  // ซ่อน password ใน output
  const maskedUrl = directUrl.replace(/:([^:@]+)@/, ':***@');
  console.log('✅ DIRECT_URL พบแล้ว:');
  console.log(`   ${maskedUrl}\n`);
  
  // ตรวจสอบ format
  if (!directUrl.includes('postgresql://')) {
    console.warn('⚠️  DIRECT_URL format อาจไม่ถูกต้อง (ควรเริ่มด้วย postgresql://)\n');
  }
  
  if (!directUrl.includes(':5432')) {
    console.warn('⚠️  DIRECT_URL ควรใช้ port 5432 (Direct Connection)\n');
  }
}

// ตรวจสอบ DATABASE_URL
if (!databaseUrl) {
  console.error('❌ DATABASE_URL ไม่พบใน .env');
  console.log('   ต้องเพิ่ม DATABASE_URL สำหรับ Prisma Client\n');
} else {
  // ซ่อน password ใน output
  const maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ':***@');
  console.log('✅ DATABASE_URL พบแล้ว:');
  console.log(`   ${maskedUrl}\n`);
  
  // ตรวจสอบ format
  if (!databaseUrl.includes('postgresql://')) {
    console.warn('⚠️  DATABASE_URL format อาจไม่ถูกต้อง (ควรเริ่มด้วย postgresql://)\n');
  }
  
  if (!databaseUrl.includes(':6543') && !databaseUrl.includes('pgbouncer')) {
    console.warn('⚠️  DATABASE_URL ควรใช้ port 6543 และ pgbouncer=true (Connection Pooling)\n');
  }
}

// สรุป
if (directUrl && databaseUrl) {
  console.log('✅ ทั้ง DIRECT_URL และ DATABASE_URL พบแล้ว');
  console.log('   คุณสามารถรันคำสั่งต่อไปนี้ได้:');
  console.log('   - npx prisma db pull');
  console.log('   - npx prisma generate\n');
} else {
  console.error('❌ กรุณาตั้งค่า environment variables ให้ครบถ้วนก่อน');
  console.log('   ดูคำแนะนำใน PRISMA_ENV_SETUP.md\n');
}


