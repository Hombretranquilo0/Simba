import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ManagerService {
  constructor(private prisma: PrismaService) {}

  async getInventory(branchId?: string) {
    const products = await this.prisma.product.findMany({
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

    if (!branchId) return products;

    // Merge branch-specific stock
    const inventory = await this.prisma.branchInventory.findMany({
      where: { branchId, productId: { in: products.map((p) => p.id) } },
    });
    const map = new Map(inventory.map((r) => [r.productId, r]));

    return products.map((p) => {
      const row = map.get(p.id);
      return row ? { ...p, stockQuantity: row.stockQuantity, inStock: row.inStock } : p;
    });
  }

  async getOrders(branchId?: string) {
    return this.prisma.order.findMany({
      where: branchId ? { branchId } : undefined,
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: { product: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRevenue(branchId?: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        status: 'completed',
        ...(branchId ? { branchId } : {}),
      },
      select: { total: true, createdAt: true },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    const revenueByDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      revenueByDay[d.toISOString().split('T')[0]] = 0;
    }
    orders.forEach((o) => {
      const day = o.createdAt.toISOString().split('T')[0];
      if (revenueByDay[day] !== undefined) revenueByDay[day] += o.total;
    });

    return { totalRevenue, revenueByDay, orderCount: orders.length };
  }

  async updateProduct(
    id: number,
    data: {
      price?: number;
      stockQuantity?: number;
      inStock?: boolean;
      discount?: number | null;
      branchId?: string;
    },
  ) {
    const { branchId, stockQuantity, inStock, ...globalFields } = data;

    // Update global fields (price, discount) on the Product
    if (Object.keys(globalFields).length > 0) {
      await this.prisma.product.update({ where: { id }, data: globalFields });
    }

    // If branchId provided, upsert branch-specific stock
    if (branchId && (stockQuantity !== undefined || inStock !== undefined)) {
      await this.prisma.branchInventory.upsert({
        where: { branchId_productId: { branchId, productId: id } },
        create: {
          branchId,
          productId: id,
          stockQuantity: stockQuantity ?? 0,
          inStock: inStock ?? true,
        },
        update: {
          ...(stockQuantity !== undefined ? { stockQuantity } : {}),
          ...(inStock !== undefined ? { inStock } : {}),
        },
      });
    } else if (!branchId && (stockQuantity !== undefined || inStock !== undefined)) {
      // No branch: update global product stock
      await this.prisma.product.update({
        where: { id },
        data: {
          ...(stockQuantity !== undefined ? { stockQuantity } : {}),
          ...(inStock !== undefined ? { inStock } : {}),
        },
      });
    }

    return this.prisma.product.findUnique({ where: { id } });
  }
}
