/**
 * seed-super-admin.ts
 * Creates the single super admin account (idempotent — safe to re-run).
 *
 * Run from Backend/:
 *   npx ts-node prisma/seed-super-admin.ts
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ── Change these credentials as needed ──────────────────────────────────────
const SUPER_ADMIN_EMAIL    = 'superadmin@simba.rw';
const SUPER_ADMIN_PASSWORD = 'SimbaAdmin2026!';
const SUPER_ADMIN_NAME     = 'Super Admin';
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: SUPER_ADMIN_EMAIL } });

  if (existing) {
    if (existing.role === 'super_admin') {
      console.log(`✓ Super admin already exists (id=${existing.id}). Nothing to do.`);
      return;
    }
    // Upgrade existing account to super_admin
    await prisma.user.update({
      where: { email: SUPER_ADMIN_EMAIL },
      data: { role: 'super_admin', managedBranchId: null },
    });
    console.log(`✓ Upgraded existing user ${SUPER_ADMIN_EMAIL} to super_admin.`);
    return;
  }

  const hashed = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
  const user = await prisma.user.create({
    data: {
      email: SUPER_ADMIN_EMAIL,
      password: hashed,
      name: SUPER_ADMIN_NAME,
      role: 'super_admin',
    },
  });

  console.log(`✅ Super admin created:`);
  console.log(`   Email   : ${user.email}`);
  console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
  console.log(`   ID      : ${user.id}`);
}

main()
  .catch((e) => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
