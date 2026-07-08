import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedItemsService {
  constructor(private prisma: PrismaService) {}

  /** Return all saved items for a user, including product details. */
  async findAll(userId: number) {
    const rows = await this.prisma.savedItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Flatten to a shape the frontend already understands (CartItem-like)
    return rows.map((row) => ({
      id: row.product.id,
      name: row.product.name,
      price: row.product.price,
      image: row.product.image,
      category: row.product.category,
      quantity: 1,
    }));
  }

  /** Save a product for a user. Idempotent — silently succeeds if already saved. */
  async save(userId: number, productId: number) {
    try {
      await this.prisma.savedItem.create({
        data: { userId, productId },
      });
    } catch (err: any) {
      // P2002 = unique constraint violation → already saved, that's fine
      if (err?.code !== 'P2002') throw err;
    }
    return { success: true };
  }

  /** Remove a saved item for a user. */
  async remove(userId: number, productId: number) {
    await this.prisma.savedItem.deleteMany({
      where: { userId, productId },
    });
    return { success: true };
  }
}
