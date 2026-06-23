import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ManagerService {
  constructor(private prisma: PrismaService) {}

  async getInventory() {
    return this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        stockQuantity: true,
        category: true,
        inStock: true,
        discount: true,
      },
    });
  }

  async getOrders() {
    return this.prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getRevenue() {
    const orders = await this.prisma.order.findMany({
      where: {
        status: 'completed',
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Initialize last 7 days with 0 revenue
    const revenueByDay = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const day = date.toISOString().split('T')[0];
      revenueByDay[day] = 0;
    }

    // Fill in actual revenue
    orders.forEach((order) => {
      const day = order.createdAt.toISOString().split('T')[0];
      if (revenueByDay[day] !== undefined) {
        revenueByDay[day] += order.total;
      }
    });

    return {
      totalRevenue,
      revenueByDay,
      orderCount: orders.length,
    };
  }

  async updateProduct(id: number, data: { price?: number; stockQuantity?: number; inStock?: boolean; discount?: number | null }) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }
}
