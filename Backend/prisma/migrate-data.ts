import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';

const pg = new PrismaClient();
const sqlite = new Database('prisma/dev.db');

async function migrate() {
  console.log('Migrating data from SQLite to PostgreSQL...');

  const products = sqlite.prepare('SELECT * FROM Product').all();
  console.log(`Found ${products.length} products`);

  for (const p of products) {
    await pg.product.create({
      data: {
        name: p.name,
        price: p.price,
        category: p.category,
        subcategoryId: p.subcategoryId,
        inStock: Boolean(p.inStock),
        image: p.image,
        unit: p.unit,
        description: p.description,
        translations: p.translations,
        stockQuantity: p.stockQuantity,
        discount: p.discount,
      },
    });
  }
  console.log('Products migrated');

  const users = sqlite.prepare('SELECT id, email, password, name, role, googleId FROM User').all();
  console.log(`Found ${users.length} users`);

  for (const u of users) {
    await pg.user.create({
      data: {
        email: u.email,
        password: u.password,
        name: u.name,
        role: u.role,
        googleId: u.googleId,
      },
    });
  }
  console.log('Users migrated');

  const orders = sqlite.prepare('SELECT id, userId, total, status, createdAt, updatedAt FROM "Order"').all();
  console.log(`Found ${orders.length} orders`);

  for (const o of orders) {
    await pg.order.create({
      data: {
        userId: o.userId,
        total: o.total,
        status: o.status,
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
        items: {
          create: sqlite.prepare('SELECT * FROM OrderItem WHERE orderId = ?').all(o.id).map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });
  }
  console.log('Orders migrated');

  await pg.$disconnect();
  sqlite.close();
  console.log('Migration complete!');
}

migrate().catch(e => {
  console.error(e);
  process.exit(1);
});
