import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { minPrice?: number; maxPrice?: number }) {
    const where: any = {};
    
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async findByCategory(category: string) {
    return this.prisma.product.findMany({
      where: { category },
    });
  }
}
