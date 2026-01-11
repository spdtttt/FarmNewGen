/**
 * ตัวอย่างการใช้งาน Prisma Client กับ Supabase Database
 * 
 * หมายเหตุ: ไฟล์นี้เป็นตัวอย่างสำหรับ Node.js/Backend
 * สำหรับ React Native app ควรใช้ผ่าน API server
 */

import prisma from '../lib/prisma';

// ============================================
// ตัวอย่าง: Profile Operations
// ============================================

// สร้าง Profile ใหม่
export async function createProfile(userId: string, fullName?: string) {
  try {
    const profile = await prisma.profile.create({
      data: {
        userId,
        fullName,
      },
    });
    return profile;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
}

// อ่าน Profile จาก userId
export async function getProfileByUserId(userId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        userId,
      },
    });
    return profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

// อัปเดต Profile
export async function updateProfile(userId: string, data: {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
}) {
  try {
    const profile = await prisma.profile.update({
      where: {
        userId,
      },
      data,
    });
    return profile;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// ============================================
// ตัวอย่าง: Product Operations
// ============================================

// สร้าง Product ใหม่
export async function createProduct(data: {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock?: number;
  category?: string;
}) {
  try {
    const product = await prisma.product.create({
      data,
    });
    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

// อ่าน Products ทั้งหมด
export async function getAllProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// อ่าน Product จาก ID
export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

// ค้นหา Products ตาม category
export async function getProductsByCategory(category: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        category,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return products;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
}

// อัปเดต Product
export async function updateProduct(id: string, data: {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  stock?: number;
  category?: string;
}) {
  try {
    const product = await prisma.product.update({
      where: {
        id,
      },
      data,
    });
    return product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// ลบ Product
export async function deleteProduct(id: string) {
  try {
    const product = await prisma.product.delete({
      where: {
        id,
      },
    });
    return product;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// ============================================
// ตัวอย่าง: Order Operations
// ============================================

// สร้าง Order ใหม่
export async function createOrder(userId: string, total: number) {
  try {
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: 'PENDING',
      },
    });
    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// อ่าน Orders ของ user
export async function getOrdersByUserId(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

// อัปเดต Order status
export async function updateOrderStatus(id: string, status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') {
  try {
    const order = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
    return order;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// ============================================
// ตัวอย่าง: Advanced Queries
// ============================================

// Transaction example
export async function createOrderWithProducts(userId: string, products: Array<{ id: string; quantity: number; price: number }>) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // คำนวณ total
      const total = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // สร้าง order
      const order = await tx.order.create({
        data: {
          userId,
          total,
          status: 'PENDING',
        },
      });

      // อัปเดต stock ของ products
      for (const item of products) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    return result;
  } catch (error) {
    console.error('Error in transaction:', error);
    throw error;
  }
}

// Pagination example
export async function getProductsPaginated(page: number = 1, pageSize: number = 10) {
  try {
    const skip = (page - 1) * pageSize;
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count(),
    ]);

    return {
      products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error('Error fetching paginated products:', error);
    throw error;
  }
}


