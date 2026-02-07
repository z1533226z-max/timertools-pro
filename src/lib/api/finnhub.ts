import { StockData } from '@/types/market';
import { withCache } from '@/lib/cache';
import { US_STOCKS } from '@/lib/constants';

const API_KEY = process.env.FINNHUB_API_KEY || '';
const BASE_URL = 'https://finnhub.io/api/v1';

async function fetchQuote(symbol: string): Promise<{
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
} | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getUSStocks(): Promise<StockData[]> {
  return withCache('us-stocks', 30, async () => {
    if (!API_KEY) return getMockUSStocks();

    const results = await Promise.allSettled(
      US_STOCKS.map(async (stock) => {
        const quote = await fetchQuote(stock.symbol);
        if (!quote || quote.c === 0) {
          return getMockUSStock(stock.symbol, stock.name);
        }
        return {
          code: stock.symbol,
          name: stock.symbol,
          nameKr: stock.name,
          market: 'NASDAQ' as const,
          price: quote.c,
          previousClose: quote.pc,
          change: quote.d,
          changePercent: quote.dp,
          high: quote.h,
          low: quote.l,
          volume: 0,
          updatedAt: new Date().toISOString(),
          currency: 'USD' as const,
        };
      })
    );

    return results
      .filter((r): r is PromiseFulfilledResult<StockData> => r.status === 'fulfilled')
      .map((r) => r.value);
  });
}

function getMockUSStock(symbol: string, nameKr: string): StockData {
  const mockPrices: Record<string, number> = {
    AAPL: 195.50,
    TSLA: 248.30,
    NVDA: 875.40,
    MSFT: 420.15,
    AMZN: 185.60,
    GOOGL: 155.80,
    META: 510.25,
    NFLX: 685.90,
    AMD: 165.20,
    AVGO: 1680.50,
  };
  const price = mockPrices[symbol] || 100;
  const change = +(Math.random() * 6 - 3).toFixed(2);
  return {
    code: symbol,
    name: symbol,
    nameKr,
    market: 'NASDAQ',
    price,
    previousClose: price - change,
    change,
    changePercent: +((change / (price - change)) * 100).toFixed(2),
    volume: 0,
    updatedAt: new Date().toISOString(),
    currency: 'USD',
  };
}

function getMockUSStocks(): StockData[] {
  return US_STOCKS.map((stock) => getMockUSStock(stock.symbol, stock.name));
}
