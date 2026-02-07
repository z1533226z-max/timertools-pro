'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StockData } from '@/types/market';
import { getChangeColor, getArrow } from '@/lib/utils';
import { REFRESH_INTERVALS } from '@/lib/constants';

export default function HomeUSStocks() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStocks() {
      try {
        const res = await fetch('/api/market/stocks-us');
        const json = await res.json();
        if (json.success) setStocks(json.data.slice(0, 6));
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchStocks();
    const interval = setInterval(fetchStocks, REFRESH_INTERVALS.US_STOCKS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">미국 주요 종목</h2>
        <Link href="/stocks/us" className="text-xs text-primary-600 hover:text-primary-800 font-medium">
          전체보기 →
        </Link>
      </div>

      <div className="divide-y divide-gray-50">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-2.5">
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
            </div>
          ))
        ) : (
          stocks.map((stock) => (
            <div key={stock.code} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <span className="text-sm font-medium text-gray-800">{stock.code}</span>
                <span className="text-xs text-gray-400 ml-1">{stock.nameKr}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium price-text">${stock.price.toFixed(2)}</div>
                <div className={`text-xs price-text ${getChangeColor(stock.changePercent)}`}>
                  {getArrow(stock.changePercent)} {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
