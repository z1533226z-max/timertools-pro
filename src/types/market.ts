export interface PriceData {
  name: string;
  nameKr: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  volume?: number;
  updatedAt: string;
  currency: 'KRW' | 'USD';
}

export interface StockData extends PriceData {
  code: string;
  market: 'KOSPI' | 'KOSDAQ' | 'NASDAQ' | 'NYSE' | 'SP500';
  rank?: number;
}

export interface VolumeRankItem {
  rank: number;
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  volumeChange?: number;
  market: 'KOSPI' | 'KOSDAQ';
}

export interface CryptoData extends PriceData {
  symbol: string;
  marketCap?: number;
  volume24h?: number;
}

export interface GoldSilverData {
  goldKrw: number;
  goldUsd: number;
  goldChange: number;
  goldChangePercent: number;
  silverKrw: number;
  silverUsd: number;
  silverChange: number;
  silverChangePercent: number;
  goldPerDon: number;
  updatedAt: string;
}

export interface BondData {
  name: string;
  yield: number;
  previousYield: number;
  change: number;
  maturity: string;
  updatedAt: string;
}

export interface ExchangeRate {
  usdKrw: number;
  change: number;
  changePercent: number;
  updatedAt: string;
}

export interface MarketSummaryData {
  kospiIndex: number;
  kospiChange: number;
  kosdaqIndex: number;
  kosdaqChange: number;
  sp500Index: number;
  sp500Change: number;
  nasdaqIndex: number;
  nasdaqChange: number;
  usdKrw: number;
  usdKrwChange: number;
  updatedAt: string;
}

export interface StockPick {
  id: string;
  date: string;
  code: string;
  name: string;
  market: 'KOSPI' | 'KOSDAQ';
  currentPrice: number;
  buyPrice: number;
  targetPrice: number;
  stopLoss: number;
  reason: string;
  indicators: {
    volumeChange: number;
    rsi?: number;
    ma5?: number;
    ma20?: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  };
  result?: {
    finalPrice: number;
    returnPercent: number;
    hit: boolean;
  };
  createdAt: string;
}

export interface DailyReport {
  date: string;
  title: string;
  summary: string;
  sections: {
    category: string;
    content: string;
  }[];
  keyPoints: string[];
  outlook: string;
  createdAt: string;
}

export type MarketCategory = 'stocks' | 'stocks-us' | 'crypto' | 'gold' | 'silver' | 'bonds';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  updatedAt: string;
  cached?: boolean;
}
