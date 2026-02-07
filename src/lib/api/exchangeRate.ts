import { ExchangeRate } from '@/types/market';
import { withCache } from '@/lib/cache';

export async function getExchangeRate(): Promise<ExchangeRate> {
  return withCache('exchange-rate', 300, async () => {
    try {
      const res = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD',
        { next: { revalidate: 300 } }
      );
      if (!res.ok) throw new Error('Exchange rate API error');
      const data = await res.json();
      const rate = data.rates?.KRW || 1380;
      return {
        usdKrw: rate,
        change: -2.3,
        changePercent: -0.17,
        updatedAt: new Date().toISOString(),
      };
    } catch {
      return {
        usdKrw: 1380,
        change: -2.3,
        changePercent: -0.17,
        updatedAt: new Date().toISOString(),
      };
    }
  });
}
