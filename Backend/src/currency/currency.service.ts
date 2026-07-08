import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CurrencyRates {
  USD: number;
  EUR: number;
  updatedAt: string | null;
}

// Default fallback rates (approximate as of mid-2025)
const DEFAULTS = { USD: 0.000714, EUR: 0.000658 };

@Injectable()
export class CurrencyService {
  constructor(private prisma: PrismaService) {}

  async getRates(): Promise<CurrencyRates> {
    const rows = await this.prisma.setting.findMany({
      where: { key: { in: ['USD_RATE', 'EUR_RATE'] } },
    });

    const map = new Map(rows.map((r) => [r.key, r]));
    const usdRow = map.get('USD_RATE');
    const eurRow = map.get('EUR_RATE');

    const updatedAt =
      usdRow?.updatedAt?.toISOString() ?? eurRow?.updatedAt?.toISOString() ?? null;

    return {
      USD: usdRow ? parseFloat(usdRow.value) : DEFAULTS.USD,
      EUR: eurRow ? parseFloat(eurRow.value) : DEFAULTS.EUR,
      updatedAt,
    };
  }

  async updateRates(usd?: number, eur?: number): Promise<CurrencyRates> {
    if (usd !== undefined) {
      await this.prisma.setting.upsert({
        where: { key: 'USD_RATE' },
        create: { key: 'USD_RATE', value: String(usd) },
        update: { value: String(usd) },
      });
    }
    if (eur !== undefined) {
      await this.prisma.setting.upsert({
        where: { key: 'EUR_RATE' },
        create: { key: 'EUR_RATE', value: String(eur) },
        update: { value: String(eur) },
      });
    }
    return this.getRates();
  }
}
