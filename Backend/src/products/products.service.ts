import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Merge branch-specific stock into the product list.
   * When branchId is provided each product's inStock/stockQuantity
   * reflects that branch's BranchInventory row (falls back to global
   * values if no row exists yet for that branch).
   */
  private async mergeInventory(products: any[], branchId?: string): Promise<any[]> {
    if (!branchId) return products;

    const ids = products.map((p) => p.id);
    const inventory = await this.prisma.branchInventory.findMany({
      where: { branchId, productId: { in: ids } },
    });
    const map = new Map(inventory.map((r) => [r.productId, r]));

    return products.map((p) => {
      const row = map.get(p.id);
      return row
        ? { ...p, stockQuantity: row.stockQuantity, inStock: row.inStock }
        : p; // fall back to global values
    });
  }

  async findAll(filters?: {
    minPrice?: number;
    maxPrice?: number;
    branchId?: string;
  }) {
    const where: any = {};
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    const products = await this.prisma.product.findMany({
      where,
      orderBy: { id: 'asc' },
    });
    return this.mergeInventory(products, filters?.branchId);
  }

  async findOne(id: number, branchId?: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product || !branchId) return product;
    const [merged] = await this.mergeInventory([product], branchId);
    return merged;
  }

  async findByCategory(category: string, branchId?: string) {
    const products = await this.prisma.product.findMany({ where: { category } });
    return this.mergeInventory(products, branchId);
  }

  async findDiscounted(branchId?: string) {
    const products = await this.prisma.product.findMany({
      where: { discount: { gt: 0 } },
      orderBy: { discount: 'desc' },
    });
    return this.mergeInventory(products, branchId);
  }
}
