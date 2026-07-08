import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const r = await prisma.user.deleteMany({ where: { role: 'manager' } });
  console.log(`Deleted ${r.count} manager user(s).`);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
