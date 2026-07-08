import { PrismaClient } from '@prisma/client';

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

async function main() {
  console.log('Seeding BranchInventory…');

  const products = await prisma.product.findMany({
    select: { id: true, stockQuantity: true, inStock: true },
  });

  console.log(`Found ${products.length} products, seeding for ${BRANCH_IDS.length} branches…`);

  let created = 0;
  let skipped = 0;

  for (const branch of BRANCH_IDS) {
    for (const product of products) {
      // Each branch gets independent stock — seed from global value
      // so the store starts with realistic numbers
      const result = await prisma.branchInventory.upsert({
        where: { branchId_productId: { branchId: branch, productId: product.id } },
        create: {
          branchId: branch,
          productId: product.id,
          stockQuantity: product.stockQuantity,
          inStock: product.inStock,
        },
        update: {}, // don't overwrite existing rows
      });
      if (result) created++;
    }
    console.log(`  ✓ Branch "${branch}" done`);
  }

  console.log(`\nDone. ${created} BranchInventory rows upserted.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
