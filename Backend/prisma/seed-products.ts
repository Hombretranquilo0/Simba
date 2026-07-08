import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = [
    { name: 'Milk 1L', price: 1200, category: 'Food & Beverages', inStock: true, stockQuantity: 50, unit: 'L' },
    { name: 'Bread Loaf', price: 800, category: 'Food & Beverages', inStock: true, stockQuantity: 30, unit: 'Pcs' },
    { name: 'Eggs (Tray of 30)', price: 3500, category: 'Food & Beverages', inStock: true, stockQuantity: 20, unit: 'Tray' },
    { name: 'Rice 5kg', price: 5500, category: 'Food & Beverages', inStock: true, stockQuantity: 40, unit: 'Bag' },
    { name: 'Sugar 1kg', price: 1800, category: 'Food & Beverages', inStock: true, stockQuantity: 60, unit: 'Kg' },
    { name: 'Soap Bar', price: 500, category: 'Household Essentials', inStock: true, stockQuantity: 100, unit: 'Pcs' },
    { name: 'Toothpaste', price: 1200, category: 'Cosmetics & Personal Care', inStock: true, stockQuantity: 45, unit: 'Pcs' },
    { name: 'Bananas (Bunch)', price: 1500, category: 'Fresh Produce', inStock: true, stockQuantity: 25, unit: 'Bunch' },
    { name: 'Tomatoes 1kg', price: 900, category: 'Fresh Produce', inStock: true, stockQuantity: 35, unit: 'Kg' },
    { name: 'Cooking Oil 1L', price: 2200, category: 'Food & Beverages', inStock: true, stockQuantity: 40, unit: 'L' },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log(`Seeded ${products.length} products`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
