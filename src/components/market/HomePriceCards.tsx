'use client';

import { useState, useEffect } from 'react';
import PriceCard from './PriceCard';
import { MarketSummaryData, GoldSilverData, CryptoData } from '@/types/market';

export default function HomePriceCards() {
  const [marketData, setMarketData] = useState<MarketSummaryData | null>(null);
  const [goldData, setGoldData] = useState<GoldSilverData | null>(null);
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);

  useEffect(() => {
    async function fetchAll() {
      const [mRes, gRes, cRes] = await Promise.allSettled([
        fetch('/api/market/summary').then((r) => r.json()),
        fetch('/api/market/gold').then((r) => r.json()),
        fetch('/api/market/crypto').then((r) => r.json()),
      ]);
      if (mRes.status === 'fulfilled' && mRes.value.success) setMarketData(mRes.value.data);
      if (gRes.status === 'fulfilled' && gRes.value.success) setGoldData(gRes.value.data);
      if (cRes.status === 'fulfilled' && cRes.value.success) setCryptoData(cRes.value.data);
    }
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, []);

  const btc = cryptoData.find((c) => c.symbol === 'BTC');

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <PriceCard
        title="KOSPI"
        icon="📈"
        price={marketData?.kospiIndex || 0}
        change={marketData?.kospiChange || 0}
        changePercent={marketData ? (marketData.kospiChange / marketData.kospiIndex) * 100 : 0}
        href="/stocks"
      />
      <PriceCard
        title="KOSDAQ"
        icon="📊"
        price={marketData?.kosdaqIndex || 0}
        change={marketData?.kosdaqChange || 0}
        changePercent={marketData ? (marketData.kosdaqChange / marketData.kosdaqIndex) * 100 : 0}
        href="/stocks"
      />
      <PriceCard
        title="금 시세"
        icon="🥇"
        price={goldData?.goldKrw || 0}
        change={goldData ? goldData.goldKrw * (goldData.goldChangePercent / 100) : 0}
        changePercent={goldData?.goldChangePercent || 0}
        href="/gold"
      />
      <PriceCard
        title="비트코인"
        icon="₿"
        price={btc?.price || 0}
        change={btc?.change || 0}
        changePercent={btc?.changePercent || 0}
        href="/crypto"
      />
      <PriceCard
        title="환율"
        subtitle="USD/KRW"
        price={marketData?.usdKrw || 0}
        change={marketData?.usdKrwChange || 0}
        changePercent={marketData ? (marketData.usdKrwChange / marketData.usdKrw) * 100 : 0}
      />
    </div>
  );
}
