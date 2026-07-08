import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const rates = [
    { key: 'USD_RATE', value: '0.000714' },  // 1 RWF ≈ 0.000714 USD  (1 USD ≈ 1,400 RWF)
    { key: 'EUR_RATE', value: '0.000658' },  // 1 RWF ≈ 0.000658 EUR  (1 EUR ≈ 1,520 RWF)
  ];
  for (const r of rates) {
    await prisma.setting.upsert({
      where: { key: r.key },
      create: r,
      update: {},  // don't overwrite if already set
    });
    console.log(`✓ ${r.key} = ${r.value}`);
  }
  console.log('✅  Default currency rates seeded.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
