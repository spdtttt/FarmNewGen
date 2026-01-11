/**
 * สคริปต์ทดสอบการเชื่อมต่อ Database
 * รัน: node scripts/test-db-connection.js
 */

require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
  const directUrl = process.env.DIRECT_URL;
  
  if (!directUrl) {
    console.error('❌ DIRECT_URL ไม่พบใน .env');
    process.exit(1);
  }

  console.log('🔍 กำลังทดสอบการเชื่อมต่อ Database...\n');
  
  // ซ่อน password ใน output
  const maskedUrl = directUrl.replace(/:([^:@]+)@/, ':***@');
  console.log(`Connection String: ${maskedUrl}\n`);

  // Parse connection string
  const url = new URL(directUrl);
  const client = new Client({
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1) || 'postgres',
    user: url.username || 'postgres',
    password: url.password,
    // ใช้ IPv4 แทน IPv6
    family: 4,
    // เพิ่ม timeout
    connectionTimeoutMillis: 10000,
    // SSL สำหรับ Supabase
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log('✅ เชื่อมต่อ Database สำเร็จ!\n');
    
    // ทดสอบ query
    const result = await client.query('SELECT version()');
    console.log('Database Version:', result.rows[0].version.split(',')[0]);
    
    // แสดง tables ที่มี
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables ใน Database:');
    if (tablesResult.rows.length === 0) {
      console.log('   (ยังไม่มี tables)');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
    await client.end();
    console.log('\n✅ การทดสอบเสร็จสมบูรณ์');
    
  } catch (error) {
    console.error('\n❌ ไม่สามารถเชื่อมต่อ Database ได้');
    console.error('Error:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.error('\n💡 ปัญหา: Password authentication failed');
      console.error('\n📝 วิธีแก้ไข:');
      console.error('   1. ไปที่ Supabase Dashboard > Settings > Database');
      console.error('   2. ตรวจสอบ database password หรือ reset password');
      console.error('   3. คัดลอก Connection string ใหม่:');
      console.error('      - สำหรับ DIRECT_URL: เลือก "Direct connection" + "URI"');
      console.error('      - ตรวจสอบว่า username เป็น "postgres" (ไม่ใช่ "postgres.PROJECT-REF")');
      console.error('   4. อัปเดตไฟล์ .env ด้วย connection string ใหม่');
      console.error('\n⚠️  หมายเหตุ:');
      console.error('   - Direct connection ควรใช้: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres');
      console.error('   - Connection pooling ควรใช้: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@pooler.supabase.com:6543/...');
      console.error('   - สำหรับ Prisma db pull ต้องใช้ Direct connection (port 5432)');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n💡 แนะนำ:');
      console.error('   1. ตรวจสอบว่า connection string format ถูกต้อง');
      console.error('   2. ตรวจสอบว่า network connection ทำงานปกติ');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 แนะนำ:');
      console.error('   1. ตรวจสอบว่า connection string format ถูกต้อง');
      console.error('   2. ตรวจสอบ port number (5432 สำหรับ direct, 6543 สำหรับ pooling)');
      console.error('   3. ตรวจสอบว่า Supabase project ยัง active อยู่');
    }
    
    process.exit(1);
  }
}

testConnection();

