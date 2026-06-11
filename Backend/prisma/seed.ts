import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  // Use absolute path or carefully constructed relative path
  const dataPath = path.resolve(__dirname, '../../Frontend/data/products.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error(`Data file not found at: ${dataPath}`);
    return;
  }

  const rawData = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(rawData);

  console.log(`Seeding ${data.products.length} products...`);

  for (const product of data.products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        price: product.price,
        category: product.category,
        subcategoryId: product.subcategoryId,
        inStock: product.inStock !== undefined ? product.inStock : true,
        image: product.image,
        unit: product.unit,
        description: product.description || null,
        translations: product.translations || null,
      },
      create: {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        subcategoryId: product.subcategoryId,
        inStock: product.inStock !== undefined ? product.inStock : true,
        image: product.image,
        unit: product.unit,
        description: product.description || null,
        translations: product.translations || null,
      },
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
