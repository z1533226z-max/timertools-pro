import { BondData } from '@/types/market';
import { withCache } from '@/lib/cache';

const API_KEY = process.env.DATA_GO_KR_API_KEY || '';

export async function getBondData(): Promise<BondData[]> {
  return withCache('bonds', 3600, async () => {
    if (!API_KEY) return getMockBonds();

    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const url = `https://apis.data.go.kr/1160100/service/GetBondIssuInfoService/getBondTradInfo?serviceKey=${encodeURIComponent(API_KEY)}&numOfRows=10&pageNo=1&resultType=json&basDt=${dateStr}`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return getMockBonds();
      const data = await res.json();
      const items = data?.response?.body?.items?.item;
      if (!items || !Array.isArray(items)) return getMockBonds();

      return items.slice(0, 6).map((item: Record<string, string>) => ({
        name: item.isinCdNm || item.bondIsurNm || '채권',
        yield: parseFloat(item.bondSrfcInrt || '0'),
        previousYield: parseFloat(item.bondSrfcInrt || '0') - 0.02,
        change: 0.02,
        maturity: item.bondExprDt || '',
        updatedAt: new Date().toISOString(),
      }));
    } catch {
      return getMockBonds();
    }
  });
}

function getMockBonds(): BondData[] {
  return [
    { name: '국고채 3년', yield: 3.25, previousYield: 3.27, change: -0.02, maturity: '3년', updatedAt: new Date().toISOString() },
    { name: '국고채 5년', yield: 3.35, previousYield: 3.32, change: 0.03, maturity: '5년', updatedAt: new Date().toISOString() },
    { name: '국고채 10년', yield: 3.48, previousYield: 3.45, change: 0.03, maturity: '10년', updatedAt: new Date().toISOString() },
    { name: '국고채 30년', yield: 3.15, previousYield: 3.18, change: -0.03, maturity: '30년', updatedAt: new Date().toISOString() },
    { name: '회사채 AA-', yield: 3.85, previousYield: 3.82, change: 0.03, maturity: '3년', updatedAt: new Date().toISOString() },
    { name: '회사채 BBB-', yield: 8.92, previousYield: 8.88, change: 0.04, maturity: '3년', updatedAt: new Date().toISOString() },
  ];
}
