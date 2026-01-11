import { PrismaClient } from '@prisma/client';

// สร้าง Prisma Client instance
// ใน development จะ log queries เพื่อ debug
// ใน production จะไม่ log
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Prisma 7.2.0+ จะอ่าน DATABASE_URL จาก environment variables อัตโนมัติ
    // หรือสามารถส่งผ่าน datasourceUrl ได้
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

// ใช้ globalThis เพื่อป้องกันการสร้าง Prisma Client หลาย instance
// ใน development (hot reload)
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

