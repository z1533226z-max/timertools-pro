import { GoldSilverData } from '@/types/market';
import { withCache } from '@/lib/cache';

const GOLDAPI_KEY = process.env.GOLDAPI_KEY || '';
const BASE_URL = 'https://www.goldapi.io/api';

async function fetchGoldPrice(): Promise<{ price: number; prevClose: number }> {
  if (!GOLDAPI_KEY) {
    return { price: 2650.50, prevClose: 2640.00 };
  }
  const res = await fetch(`${BASE_URL}/XAU/USD`, {
    headers: { 'x-access-token': GOLDAPI_KEY },
    next: { revalidate: 300 },
  });
  if (!res.ok) return { price: 2650.50, prevClose: 2640.00 };
  const data = await res.json();
  return {
    price: data.price || 2650.50,
    prevClose: data.prev_close_price || 2640.00,
  };
}

async function fetchSilverPrice(): Promise<{ price: number; prevClose: number }> {
  if (!GOLDAPI_KEY) {
    return { price: 31.20, prevClose: 30.80 };
  }
  const res = await fetch(`${BASE_URL}/XAG/USD`, {
    headers: { 'x-access-token': GOLDAPI_KEY },
    next: { revalidate: 300 },
  });
  if (!res.ok) return { price: 31.20, prevClose: 30.80 };
  const data = await res.json();
  return {
    price: data.price || 31.20,
    prevClose: data.prev_close_price || 30.80,
  };
}

export async function getGoldSilverData(): Promise<GoldSilverData> {
  return withCache('gold-silver', 300, async () => {
    const [gold, silver] = await Promise.all([fetchGoldPrice(), fetchSilverPrice()]);

    const usdKrw = 1380;
    const goldChange = gold.price - gold.prevClose;
    const silverChange = silver.price - silver.prevClose;
    const goldPerDon = gold.price * usdKrw * 3.75 / 31.1035;

    return {
      goldUsd: gold.price,
      goldKrw: Math.round(gold.price * usdKrw),
      goldChange,
      goldChangePercent: (goldChange / gold.prevClose) * 100,
      silverUsd: silver.price,
      silverKrw: Math.round(silver.price * usdKrw),
      silverChange,
      silverChangePercent: (silverChange / silver.prevClose) * 100,
      goldPerDon: Math.round(goldPerDon),
      updatedAt: new Date().toISOString(),
    };
  });
}
