'use client';

import { useState, useEffect } from 'react';
import { MarketSummaryData, GoldSilverData, CryptoData } from '@/types/market';
import {
  generateKospiAnalysis,
  generateKosdaqAnalysis,
  generateGoldAnalysis,
  generateCryptoAnalysis,
} from '@/lib/marketAnalyzer';

interface DailyReportContentProps {
  date: string;
}

export default function DailyReportContent({ date }: DailyReportContentProps) {
  const [market, setMarket] = useState<MarketSummaryData | null>(null);
  const [gold, setGold] = useState<GoldSilverData | null>(null);
  const [crypto, setCrypto] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [mRes, gRes, cRes] = await Promise.allSettled([
          fetch('/api/market/summary').then((r) => r.json()),
          fetch('/api/market/gold').then((r) => r.json()),
          fetch('/api/market/crypto').then((r) => r.json()),
        ]);
        if (mRes.status === 'fulfilled' && mRes.value.success) setMarket(mRes.value.data);
        if (gRes.status === 'fulfilled' && gRes.value.success) setGold(gRes.value.data);
        if (cRes.status === 'fulfilled' && cRes.value.success) setCrypto(cRes.value.data);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const sections = [
    {
      title: 'KOSPI (코스피)',
      content: market ? generateKospiAnalysis(market) : '데이터를 불러오는 중입니다.',
      color: 'border-l-red-500',
    },
    {
      title: 'KOSDAQ (코스닥)',
      content: market ? generateKosdaqAnalysis(market) : '데이터를 불러오는 중입니다.',
      color: 'border-l-blue-500',
    },
    {
      title: '금/은 시세',
      content: gold ? generateGoldAnalysis(gold) : '데이터를 불러오는 중입니다.',
      color: 'border-l-amber-500',
    },
    {
      title: '암호화폐',
      content: crypto.length > 0 ? generateCryptoAnalysis(crypto) : '데이터를 불러오는 중입니다.',
      color: 'border-l-purple-500',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 요약 카드 */}
      {market && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">주요 지수 한눈에 보기</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-500 mb-1">KOSPI</div>
              <div className="text-lg font-bold price-text">{market.kospiIndex.toFixed(2)}</div>
              <div className={`text-xs ${market.kospiChange >= 0 ? 'text-up' : 'text-down'}`}>
                {market.kospiChange >= 0 ? '+' : ''}{market.kospiChange.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">KOSDAQ</div>
              <div className="text-lg font-bold price-text">{market.kosdaqIndex.toFixed(2)}</div>
              <div className={`text-xs ${market.kosdaqChange >= 0 ? 'text-up' : 'text-down'}`}>
                {market.kosdaqChange >= 0 ? '+' : ''}{market.kosdaqChange.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">S&P 500</div>
              <div className="text-lg font-bold price-text">{market.sp500Index.toFixed(2)}</div>
              <div className={`text-xs ${market.sp500Change >= 0 ? 'text-up' : 'text-down'}`}>
                {market.sp500Change >= 0 ? '+' : ''}{market.sp500Change.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">USD/KRW</div>
              <div className="text-lg font-bold price-text">{market.usdKrw.toFixed(2)}</div>
              <div className={`text-xs ${market.usdKrwChange >= 0 ? 'text-up' : 'text-down'}`}>
                {market.usdKrwChange >= 0 ? '+' : ''}{market.usdKrwChange.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상세 분석 */}
      {sections.map((section, index) => (
        <div
          key={index}
          className={`bg-white rounded-xl border border-gray-200 border-l-4 ${section.color} p-6`}
        >
          <h3 className="text-base font-bold text-gray-800 mb-3">{section.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
        </div>
      ))}

      <div className="text-xs text-gray-400 text-center mt-4">
        본 시황은 {date} 기준 시장 데이터를 바탕으로 자동 생성된 분석이며, 투자 권유를 목적으로 하지 않습니다.
      </div>
    </div>
  );
}
