import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface FulfillmentData {
  fulfillmentType: 'delivery' | 'pickup';
  phone?: string;
  deliveryNotes?: string;
  locationLink?: string;
  pickupName?: string;
  pickupTime?: string;
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(
    userId: number,
    items: { productId: number; quantity: number; price: number }[],
    total: number,
    fulfillment: FulfillmentData,
    branchId?: string,
  ) {
    if (!branchId) {
      throw new BadRequestException('A branch must be selected before placing an order.');
    }

    // Run everything in a single transaction so a failed stock update
    // rolls back the order row (and vice-versa).
    return this.prisma.$transaction(async (tx) => {
      // 1. Create the order
      const order = await tx.order.create({
        data: {
          userId,
          total,
          status: 'pending',
          branchId,
          fulfillmentType: fulfillment.fulfillmentType,
          phone: fulfillment.phone ?? null,
          deliveryNotes: fulfillment.deliveryNotes ?? null,
          locationLink: fulfillment.locationLink ?? null,
          pickupName: fulfillment.pickupName ?? null,
          pickupTime: fulfillment.pickupTime ?? null,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

      // 2. Decrement BranchInventory for each ordered product
      for (const item of items) {
        // Find the branch-specific inventory row
        const inv = await tx.branchInventory.findUnique({
          where: {
            branchId_productId: { branchId, productId: item.productId },
          },
        });

        if (inv) {
          const newQty = Math.max(0, inv.stockQuantity - item.quantity);
          await tx.branchInventory.update({
            where: { branchId_productId: { branchId, productId: item.productId } },
            data: {
              stockQuantity: newQty,
              inStock: newQty > 0,
            },
          });
        }
        // If no BranchInventory row exists for this branch+product yet, skip —
        // the product was shown as globally in-stock and no per-branch row exists.
      }

      return order;
    });
  }

  async getUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: { select: { name: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(id: number, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return this.prisma.order.update({ where: { id }, data: { status } });
  }
}
