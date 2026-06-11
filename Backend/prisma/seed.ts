import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

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
        stockQuantity: Math.floor(Math.random() * 100),
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
        stockQuantity: Math.floor(Math.random() * 100),
        image: product.image,
        unit: product.unit,
        description: product.description || null,
        translations: product.translations || null,
      },
    });
  }

  // Create Manager User
  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@simba.rw' },
    update: {},
    create: {
      email: 'manager@simba.rw',
      password: managerPassword,
      name: 'Simba Manager',
      role: 'manager',
    },
  });

  // Create a sample user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      password: userPassword,
      name: 'John Doe',
      role: 'user',
    },
  });

  // Create sample orders
  console.log('Creating sample orders...');
  const products = await prisma.product.findMany({ take: 5 });
  
  for (let i = 0; i < 3; i++) {
    const orderProducts = products.slice(0, 2 + i);
    const total = orderProducts.reduce((sum, p) => sum + p.price, 0);
    
    await prisma.order.create({
      data: {
        userId: user.id,
        total,
        status: i === 0 ? 'completed' : 'pending',
        items: {
          create: orderProducts.map(p => ({
            productId: p.id,
            quantity: 1,
            price: p.price,
          })),
        },
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Recent days
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
