// ============================================================================
// Seed bazy danych — przykładowe dane testowe.
// Uruchom: npm run prisma:seed  (po migracji)
//
// UWAGA: hasła w seedzie są jawne tylko dla środowiska deweloperskiego.
// Hashowanie haseł wprowadzimy w Obszarze 2 (Auth). Tu zapis poglądowy.
// ============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // --- Klient (firma + oddział), kod "101-2-018" ---
  const customer = await prisma.customer.upsert({
    where: { code: '101-2-018' },
    update: {},
    create: {
      code: '101-2-018',
      companyName: 'Przykładowa Firma Sp. z o.o.',
      branchName: 'Oddział Katowice',
      city: 'Katowice',
      postalCode: '40-001',
      country: 'PL',
    },
  });

  // --- Materiał (detal), kod "119-01" ---
  const material = await prisma.material.upsert({
    where: { code: '119-01' },
    update: {},
    create: {
      code: '119-01',
      name: 'Detal przykładowy 119-01',
      description: 'Materiał testowy do weryfikacji grawera',
      hasQrLabel: false,
    },
  });

  // --- Użytkownicy (poglądowo; hashowanie w Obszarze 2) ---
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: 'PLACEHOLDER_admin',
      fullName: 'Administrator Systemu',
      role: 'ADMIN',
    },
  });
  await prisma.user.upsert({
    where: { username: 'operator' },
    update: {},
    create: {
      username: 'operator',
      passwordHash: 'PLACEHOLDER_operator',
      fullName: 'Operator Magazynu',
      role: 'OPERATOR',
    },
  });

  // --- Zamówienie z paletą (kod pełny "101-2-018-119-01") ---
  const order = await prisma.order.upsert({
    where: { orderNumber: 'ZAM-2026-0001' },
    update: {},
    create: {
      orderNumber: 'ZAM-2026-0001',
      customerId: customer.id,
      fullClientCode: '101-2-018-119-01',
      expectedPallets: 1,
      status: 'NEW',
    },
  });

  await prisma.pallet.upsert({
    where: { huNumber: 'HU0000000001' },
    update: {},
    create: {
      huNumber: 'HU0000000001',
      orderId: order.id,
      materialId: material.id,
      expectedQuantity: 100,
      status: 'PENDING',
    },
  });

  // eslint-disable-next-line no-console
  console.warn('Seed zakończony: klient 101-2-018, materiał 119-01, zamówienie ZAM-2026-0001.');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
