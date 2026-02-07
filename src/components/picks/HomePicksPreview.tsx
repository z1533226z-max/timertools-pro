'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StockPick } from '@/types/market';
import { formatPrice, getChangeColor } from '@/lib/utils';

export default function HomePicksPreview() {
  const [picks, setPicks] = useState<StockPick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPicks() {
      try {
        const res = await fetch('/api/picks');
        const json = await res.json();
        if (json.success) setPicks(json.data.slice(0, 2));
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchPicks();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-800">AI 종목 추천</h2>
          <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full">HOT</span>
        </div>
        <Link href="/picks" className="text-xs text-primary-600 hover:text-primary-800 font-medium">
          전체보기 →
        </Link>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ) : picks.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">추천 종목을 분석 중입니다...</p>
        ) : (
          picks.map((pick) => {
            const targetReturn = ((pick.targetPrice - pick.buyPrice) / pick.buyPrice * 100).toFixed(1);
            return (
              <div key={pick.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-gray-800">{pick.name}</span>
                  <span className={`text-xs font-medium ${getChangeColor(pick.currentPrice - pick.buyPrice)}`}>
                    목표 +{targetReturn}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>매수가 {formatPrice(pick.buyPrice)}</span>
                  <span>목표가 {formatPrice(pick.targetPrice)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-400">
        투자 참고용 / 투자 책임은 본인에게 있습니다
      </div>
    </div>
  );
}
