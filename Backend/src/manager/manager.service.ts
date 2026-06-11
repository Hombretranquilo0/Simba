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
    
    // Group revenue by day for charts (basic implementation)
    const revenueByDay = orders.reduce((acc, order) => {
      const day = order.createdAt.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + order.total;
      return acc;
    }, {});

    return {
      totalRevenue,
      revenueByDay,
      orderCount: orders.length,
    };
  }

  async updateProduct(id: number, data: { price?: number; stockQuantity?: number; inStock?: boolean }) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }
}
