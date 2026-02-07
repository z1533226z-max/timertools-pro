import { CryptoData } from '@/types/market';
import { withCache } from '@/lib/cache';
import { CRYPTO_LIST } from '@/lib/constants';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export async function getCryptoData(): Promise<CryptoData[]> {
  return withCache('crypto', 60, async () => {
    try {
      const ids = CRYPTO_LIST.map((c) => c.id).join(',');
      const res = await fetch(
        `${BASE_URL}/simple/price?ids=${ids}&vs_currencies=krw,usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
        { next: { revalidate: 60 } }
      );

      if (!res.ok) throw new Error('CoinGecko API error');
      const data = await res.json();

      return CRYPTO_LIST.map((coin) => {
        const d = data[coin.id];
        if (!d) {
          return getMockCrypto(coin);
        }
        const price = d.krw || 0;
        const changePercent = d.krw_24h_change || 0;
        const previousClose = price / (1 + changePercent / 100);
        return {
          name: coin.id,
          nameKr: coin.name,
          symbol: coin.symbol,
          price,
          previousClose,
          change: price - previousClose,
          changePercent,
          volume: 0,
          volume24h: d.krw_24h_vol || 0,
          marketCap: d.krw_market_cap || 0,
          updatedAt: new Date().toISOString(),
          currency: 'KRW' as const,
        };
      });
    } catch {
      return CRYPTO_LIST.map(getMockCrypto);
    }
  });
}

function getMockCrypto(coin: { id: string; symbol: string; name: string }): CryptoData {
  const mockPrices: Record<string, number> = {
    bitcoin: 143500000,
    ethereum: 5120000,
    ripple: 3250,
    solana: 285000,
    dogecoin: 520,
    cardano: 1250,
  };
  const price = mockPrices[coin.id] || 10000;
  return {
    name: coin.id,
    nameKr: coin.name,
    symbol: coin.symbol,
    price,
    previousClose: price * 0.98,
    change: price * 0.02,
    changePercent: 2.0,
    volume: 0,
    volume24h: 0,
    marketCap: 0,
    updatedAt: new Date().toISOString(),
    currency: 'KRW',
  };
}
