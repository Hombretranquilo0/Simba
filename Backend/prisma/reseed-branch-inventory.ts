/**
 * reseed-branch-inventory.ts
 *
 * 1. Clears BranchInventory, SavedItem, OrderItem, Order, then Product
 *    (in the right FK order so nothing breaks).
 * 2. Inserts all 789 products from simba_products.json with their original IDs.
 * 3. Inserts one BranchInventory row per product × branch (all 9 branches).
 *
 * Run from the Backend/ directory:
 *   npx ts-node prisma/reseed-branch-inventory.ts
 */

import * as path from 'path';
import * as fs from 'fs';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const BRANCH_IDS = [
  'utc',
  'kimironko',
  'kigali-heights',
  'gishushu',
  'kicukiro',
  'rebero',
  'kisementi',
  'gikondo',
  'nyamirambo',
];

const JSON_PATH = path.resolve(__dirname, '../../simba_products.json');

interface RawProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  subcategoryId?: number;
  inStock?: boolean;
  image?: string;
  unit?: string;
  description?: string;
  translations?: Record<string, any>;
  stockQuantity?: number;
  discount?: number;
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
  const products: RawProduct[] = raw.products;
  console.log(`Loaded ${products.length} products from JSON.`);

  // ── Step 1: Clear dependent tables in FK order ───────────────────────────
  console.log('\nStep 1: Clearing existing data…');

  const bi = await prisma.branchInventory.deleteMany({});
  console.log(`  ✓ BranchInventory: ${bi.count} rows deleted`);

  const si = await prisma.savedItem.deleteMany({});
  console.log(`  ✓ SavedItem:        ${si.count} rows deleted`);

  const oi = await prisma.orderItem.deleteMany({});
  console.log(`  ✓ OrderItem:        ${oi.count} rows deleted`);

  const ord = await prisma.order.deleteMany({});
  console.log(`  ✓ Order:            ${ord.count} rows deleted`);

  const prod = await prisma.product.deleteMany({});
  console.log(`  ✓ Product:          ${prod.count} rows deleted`);

  // ── Step 2: Insert products with original IDs ────────────────────────────
  console.log('\nStep 2: Inserting products…');

  // Use createMany for speed — skip duplicates just in case
  const BATCH = 200;
  let inserted = 0;
  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH).map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      subcategoryId: p.subcategoryId ?? null,
      inStock: p.inStock ?? true,
      image: p.image ?? null,
      unit: p.unit ?? null,
      description: p.description ?? null,
      translations: (p.translations ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      stockQuantity: p.stockQuantity ?? 50,
      discount: p.discount ?? null,
    }));

    await prisma.product.createMany({ data: batch, skipDuplicates: true });
    inserted += batch.length;
    process.stdout.write(`  ${inserted}/${products.length}\r`);
  }
  console.log(`  ✓ ${inserted} products inserted.                   `);

  // ── Step 3: Insert BranchInventory rows ─────────────────────────────────
  console.log('\nStep 3: Inserting BranchInventory rows (9 branches × products)…');

  const rows: { branchId: string; productId: number; stockQuantity: number; inStock: boolean }[] = [];
  for (const branchId of BRANCH_IDS) {
    for (const p of products) {
      rows.push({
        branchId,
        productId: p.id,
        stockQuantity: p.stockQuantity ?? 50,
        inStock: p.inStock ?? true,
      });
    }
  }

  const BI_BATCH = 1000;
  let biInserted = 0;
  for (let i = 0; i < rows.length; i += BI_BATCH) {
    await prisma.branchInventory.createMany({ data: rows.slice(i, i + BI_BATCH) });
    biInserted += Math.min(BI_BATCH, rows.length - i);
    process.stdout.write(`  ${biInserted}/${rows.length}\r`);
  }

  console.log(`  ✓ ${biInserted} BranchInventory rows inserted.      `);
  console.log(`\n✅  Done! ${products.length} products × ${BRANCH_IDS.length} branches.`);
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
