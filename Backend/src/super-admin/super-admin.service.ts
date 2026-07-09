import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperAdminService {
  constructor(private prisma: PrismaService) {}

  // ── Manager Management ────────────────────────────────────────────────────

  async listManagers() {
    return this.prisma.user.findMany({
      where: { role: 'manager' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managedBranchId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createManager(email: string, password: string, name: string, managedBranchId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashed, name, role: 'manager', managedBranchId },
    });
    const { password: _, ...result } = user;
    return result;
  }

  async reassignManager(managerId: number, newBranchId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: managerId } });
    if (!user || user.role !== 'manager') throw new NotFoundException('Manager not found');

    const updated = await this.prisma.user.update({
      where: { id: managerId },
      data: { managedBranchId: newBranchId },
      select: { id: true, email: true, name: true, role: true, managedBranchId: true },
    });
    return updated;
  }

  async removeManager(managerId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: managerId } });
    if (!user || user.role !== 'manager') throw new NotFoundException('Manager not found');
    await this.prisma.user.delete({ where: { id: managerId } });
    return { success: true };
  }

  // ── All-branch Overview ───────────────────────────────────────────────────

  async getAllBranchesOverview() {
    const BRANCH_IDS = [
      'utc', 'kimironko', 'kigali-heights', 'gishushu',
      'kicukiro', 'rebero', 'kisementi', 'gikondo', 'nyamirambo',
    ];

    // Run sequentially — Supabase pgbouncer in transaction mode does not
    // reliably handle concurrent Prisma queries (Promise.all), causing
    // intermittent timeouts on the deployed environment.
    const allOrders = await this.prisma.order.findMany({
      select: { id: true, total: true, status: true, branchId: true, createdAt: true },
    });

    const allInventory = await this.prisma.branchInventory.findMany({
      select: { branchId: true, stockQuantity: true, inStock: true },
    });

    const managers = await this.prisma.user.findMany({
      where: { role: 'manager' },
      select: { id: true, name: true, email: true, managedBranchId: true },
    });

    const branches = BRANCH_IDS.map((branchId) => {
      const branchOrders = allOrders.filter((o) => o.branchId === branchId);
      const completedOrders = branchOrders.filter((o) => o.status === 'completed');
      const revenue = completedOrders.reduce((s, o) => s + o.total, 0);
      const branchInv = allInventory.filter((i) => i.branchId === branchId);
      const totalItems = branchInv.reduce((s, i) => s + i.stockQuantity, 0);
      const outOfStock = branchInv.filter((i) => !i.inStock).length;
      const branchManagers = managers.filter((m) => m.managedBranchId === branchId);

      return {
        branchId,
        totalOrders: branchOrders.length,
        completedOrders: completedOrders.length,
        pendingOrders: branchOrders.filter((o) => o.status === 'pending').length,
        revenue,
        totalItems,
        outOfStock,
        managers: branchManagers,
      };
    });

    const globalRevenue = allOrders
      .filter((o) => o.status === 'completed')
      .reduce((s, o) => s + o.total, 0);

    return {
      branches,
      totals: {
        revenue: globalRevenue,
        orders: allOrders.length,
        managers: managers.length,
      },
    };
  }

  async getBranchOrders(branchId: string) {
    return this.prisma.order.findMany({
      where: { branchId },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBranchInventory(branchId: string) {
    const products = await this.prisma.product.findMany({
      select: { id: true, name: true, price: true, stockQuantity: true, category: true, inStock: true, discount: true },
    });
    const inventory = await this.prisma.branchInventory.findMany({
      where: { branchId, productId: { in: products.map((p) => p.id) } },
    });
    const map = new Map(inventory.map((r) => [r.productId, r]));
    return products.map((p) => {
      const row = map.get(p.id);
      return row ? { ...p, stockQuantity: row.stockQuantity, inStock: row.inStock } : p;
    });
  }

  async getBranchRevenue(branchId: string) {
    const orders = await this.prisma.order.findMany({
      where: { status: 'completed', branchId },
      select: { total: true, createdAt: true },
    });
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
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
}
