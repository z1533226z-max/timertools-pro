import { CryptoData } from '@/types/market';
import { withCache } from '@/lib/cache';
import { CRYPTO_LIST } from '@/lib/constants';

const BASE_URL = 'https://api.upbit.com/v1';

const symbolToMarket: Record<string, string> = {
  BTC: 'KRW-BTC',
  ETH: 'KRW-ETH',
  XRP: 'KRW-XRP',
  SOL: 'KRW-SOL',
  DOGE: 'KRW-DOGE',
  ADA: 'KRW-ADA',
};

export async function getUpbitData(): Promise<CryptoData[]> {
  return withCache('upbit', 30, async () => {
    try {
      const markets = CRYPTO_LIST.map((c) => symbolToMarket[c.symbol]).filter(Boolean).join(',');
      const res = await fetch(`${BASE_URL}/ticker?markets=${markets}`, {
        next: { revalidate: 30 },
      });

      if (!res.ok) throw new Error('Upbit API error');
      const data: Array<{
        market: string;
        trade_price: number;
        prev_closing_price: number;
        signed_change_price: number;
        signed_change_rate: number;
        acc_trade_volume_24h: number;
        acc_trade_price_24h: number;
      }> = await res.json();

      return data.map((ticker) => {
        const symbol = ticker.market.replace('KRW-', '');
        const coin = CRYPTO_LIST.find((c) => c.symbol === symbol);
        return {
          name: coin?.id || symbol.toLowerCase(),
          nameKr: coin?.name || symbol,
          symbol,
          price: ticker.trade_price,
          previousClose: ticker.prev_closing_price,
          change: ticker.signed_change_price,
          changePercent: ticker.signed_change_rate * 100,
          volume: 0,
          volume24h: ticker.acc_trade_price_24h,
          updatedAt: new Date().toISOString(),
          currency: 'KRW' as const,
        };
      });
    } catch {
      return [];
    }
  });
}
