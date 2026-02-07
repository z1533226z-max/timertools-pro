'use client';

import { useState, useEffect } from 'react';
import { GoldSilverData } from '@/types/market';
import { formatPrice, getChangeColor, getArrow, formatPercent } from '@/lib/utils';
import { REFRESH_INTERVALS } from '@/lib/constants';

interface GoldSilverContentProps {
  type: 'gold' | 'silver';
}

export default function GoldSilverContent({ type }: GoldSilverContentProps) {
  const [data, setData] = useState<GoldSilverData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/market/gold');
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVALS.GOLD_SILVER);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  const isGold = type === 'gold';
  const priceUsd = isGold ? data.goldUsd : data.silverUsd;
  const priceKrw = isGold ? data.goldKrw : data.silverKrw;
  const changePercent = isGold ? data.goldChangePercent : data.silverChangePercent;
  const change = isGold ? data.goldChange : data.silverChange;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm text-gray-500 mb-2">{isGold ? '국제 금값' : '국제 은값'} (USD/oz)</h3>
          <div className="text-3xl font-bold price-text text-gray-900 mb-2">
            ${priceUsd.toFixed(2)}
          </div>
          <div className={`text-sm price-text font-medium ${getChangeColor(changePercent)}`}>
            {getArrow(changePercent)} {change > 0 ? '+' : ''}${Math.abs(change).toFixed(2)} ({formatPercent(changePercent)})
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm text-gray-500 mb-2">{isGold ? '금값' : '은값'} (원화 환산)</h3>
          <div className="text-3xl font-bold price-text text-gray-900 mb-2">
            {formatPrice(priceKrw)}
            <span className="text-sm text-gray-400 ml-1">/oz</span>
          </div>
          <div className={`text-sm price-text font-medium ${getChangeColor(changePercent)}`}>
            {getArrow(changePercent)} {formatPercent(changePercent)}
          </div>
        </div>
      </div>

      {isGold && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-6">
          <h3 className="text-sm text-amber-700 font-semibold mb-2">금 1돈(3.75g) 가격</h3>
          <div className="text-3xl font-bold price-text text-amber-900">
            {formatPrice(data.goldPerDon)}
          </div>
          <p className="text-xs text-amber-600 mt-2">
            * 국제 금값 기준 환산 가격이며, 실제 매매가와 차이가 있을 수 있습니다.
          </p>
        </div>
      )}

      <div className="text-xs text-gray-400 text-right">
        {data.updatedAt && new Date(data.updatedAt).toLocaleString('ko-KR')} 기준
      </div>
    </div>
  );
}
