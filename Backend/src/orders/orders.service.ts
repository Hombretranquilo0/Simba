import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: number, items: { productId: number; quantity: number; price: number }[], total: number) {
    return this.prisma.order.create({
      data: {
        userId,
        total,
        status: 'pending',
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  async getUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(id: number, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}
