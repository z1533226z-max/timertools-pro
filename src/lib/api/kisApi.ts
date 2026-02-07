import { VolumeRankItem, MarketSummaryData } from '@/types/market';
import { withCache } from '@/lib/cache';

const APP_KEY = process.env.KIS_APP_KEY || '';
const APP_SECRET = process.env.KIS_APP_SECRET || '';
const BASE_URL = 'https://openapi.koreainvestment.com:9443';

let accessToken = '';
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;
  if (!APP_KEY || !APP_SECRET) return '';

  try {
    const res = await fetch(`${BASE_URL}/oauth2/tokenP`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        appkey: APP_KEY,
        appsecret: APP_SECRET,
      }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
    return accessToken;
  } catch {
    return '';
  }
}

export async function getVolumeRank(market: 'KOSPI' | 'KOSDAQ' = 'KOSPI'): Promise<VolumeRankItem[]> {
  return withCache(`volume-rank-${market}`, 10, async () => {
    const token = await getAccessToken();
    if (!token) return getMockVolumeRank(market);

    try {
      const fid = market === 'KOSPI' ? '0001' : '1001';
      const params = new URLSearchParams({
        FID_COND_MRKT_DIV_CODE: 'J',
        FID_COND_SCR_DIV_CODE: '20170',
        FID_INPUT_ISCD: fid,
        FID_DIV_CLS_CODE: '0',
        FID_BLNG_CLS_CODE: '0',
        FID_TRGT_CLS_CODE: '111111111',
        FID_TRGT_EXLS_CLS_CODE: '000000',
        FID_INPUT_PRICE_1: '',
        FID_INPUT_PRICE_2: '',
        FID_VOL_CNT: '',
        FID_INPUT_DATE_1: '',
      });

      const res = await fetch(
        `${BASE_URL}/uapi/domestic-stock/v1/quotations/volume-rank?${params}`,
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            authorization: `Bearer ${token}`,
            appkey: APP_KEY,
            appsecret: APP_SECRET,
            tr_id: 'FHPST01710000',
          },
        }
      );

      if (!res.ok) return getMockVolumeRank(market);
      const data = await res.json();

      if (!data.output || !Array.isArray(data.output)) return getMockVolumeRank(market);

      return data.output.slice(0, 10).map((item: Record<string, string>, index: number) => ({
        rank: index + 1,
        code: item.mksc_shrn_iscd || item.stck_shrn_iscd || '',
        name: item.hts_kor_isnm || '',
        price: parseInt(item.stck_prpr || '0', 10),
        change: parseInt(item.prdy_vrss || '0', 10),
        changePercent: parseFloat(item.prdy_ctrt || '0'),
        volume: parseInt(item.acml_vol || '0', 10),
        market,
      }));
    } catch {
      return getMockVolumeRank(market);
    }
  });
}

export async function getMarketIndex(): Promise<MarketSummaryData> {
  return withCache('market-index', 60, async () => {
    return {
      kospiIndex: 2650.42,
      kospiChange: 12.35,
      kosdaqIndex: 870.15,
      kosdaqChange: -3.28,
      sp500Index: 5998.74,
      sp500Change: 22.44,
      nasdaqIndex: 19230.55,
      nasdaqChange: 85.12,
      usdKrw: 1380.50,
      usdKrwChange: -2.30,
      updatedAt: new Date().toISOString(),
    };
  });
}

function getMockVolumeRank(market: 'KOSPI' | 'KOSDAQ'): VolumeRankItem[] {
  const kospiMock = [
    { code: '005930', name: '삼성전자', price: 72300, change: 1500, changePercent: 2.12, volume: 28543210 },
    { code: '000660', name: 'SK하이닉스', price: 195000, change: 3000, changePercent: 1.56, volume: 5123456 },
    { code: '373220', name: 'LG에너지솔루션', price: 385000, change: -5000, changePercent: -1.28, volume: 1234567 },
    { code: '005380', name: '현대자동차', price: 248000, change: 4500, changePercent: 1.85, volume: 987654 },
    { code: '035420', name: 'NAVER', price: 215000, change: -2000, changePercent: -0.92, volume: 876543 },
    { code: '051910', name: 'LG화학', price: 342000, change: 7000, changePercent: 2.09, volume: 765432 },
    { code: '006400', name: '삼성SDI', price: 398000, change: -3000, changePercent: -0.75, volume: 654321 },
    { code: '035720', name: '카카오', price: 48500, change: 800, changePercent: 1.68, volume: 543210 },
    { code: '105560', name: 'KB금융', price: 82300, change: 1200, changePercent: 1.48, volume: 432109 },
    { code: '055550', name: '신한지주', price: 52400, change: -300, changePercent: -0.57, volume: 321098 },
  ];

  const kosdaqMock = [
    { code: '247540', name: '에코프로비엠', price: 185000, change: 5500, changePercent: 3.06, volume: 8765432 },
    { code: '086520', name: '에코프로', price: 82000, change: 2100, changePercent: 2.63, volume: 7654321 },
    { code: '196170', name: '알테오젠', price: 98700, change: -1200, changePercent: -1.20, volume: 4321098 },
    { code: '403870', name: 'HPSP', price: 45200, change: 1500, changePercent: 3.43, volume: 3210987 },
    { code: '068760', name: '셀트리온제약', price: 92500, change: 2800, changePercent: 3.12, volume: 2109876 },
    { code: '377300', name: '카카오페이', price: 28700, change: -400, changePercent: -1.37, volume: 1987654 },
    { code: '263750', name: '펄어비스', price: 42100, change: 900, changePercent: 2.19, volume: 1876543 },
    { code: '293490', name: '카카오게임즈', price: 18500, change: 350, changePercent: 1.93, volume: 1765432 },
    { code: '036570', name: '엔씨소프트', price: 187000, change: -3500, changePercent: -1.84, volume: 1654321 },
    { code: '352820', name: '하이브', price: 235000, change: 4000, changePercent: 1.73, volume: 1543210 },
  ];

  const items = market === 'KOSPI' ? kospiMock : kosdaqMock;
  return items.map((item, index) => ({
    rank: index + 1,
    ...item,
    market,
  }));
}
