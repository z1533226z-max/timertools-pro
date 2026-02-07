'use client';

import { useState, useEffect } from 'react';
import { StockData } from '@/types/market';
import { getChangeColor, getArrow } from '@/lib/utils';
import { REFRESH_INTERVALS } from '@/lib/constants';

export default function USStockList() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStocks() {
      try {
        const res = await fetch('/api/market/stocks-us');
        const json = await res.json();
        if (json.success) setStocks(json.data);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchStocks();
    const interval = setInterval(fetchStocks, REFRESH_INTERVALS.US_STOCKS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <h2 className="text-base font-bold text-gray-800">미국 주요 종목</h2>
        <span className="text-xs text-gray-400">30초 간격 업데이트</span>
      </div>

      <div className="table-responsive">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs">
              <th className="px-4 py-2 text-left">티커</th>
              <th className="px-4 py-2 text-left">종목명</th>
              <th className="px-4 py-2 text-right">현재가</th>
              <th className="px-4 py-2 text-right">등락</th>
              <th className="px-4 py-2 text-right">등락률</th>
              <th className="px-4 py-2 text-right hidden sm:table-cell">고가</th>
              <th className="px-4 py-2 text-right hidden sm:table-cell">저가</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-t border-gray-50">
                  <td colSpan={7} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : (
              stocks.map((stock) => (
                <tr key={stock.code} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-primary-700">{stock.code}</td>
                  <td className="px-4 py-2.5 text-gray-700">{stock.nameKr}</td>
                  <td className="px-4 py-2.5 text-right font-medium price-text">
                    ${stock.price.toFixed(2)}
                  </td>
                  <td className={`px-4 py-2.5 text-right price-text ${getChangeColor(stock.change)}`}>
                    {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}
                  </td>
                  <td className={`px-4 py-2.5 text-right price-text font-medium ${getChangeColor(stock.changePercent)}`}>
                    {getArrow(stock.changePercent)} {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500 hidden sm:table-cell price-text">
                    {stock.high ? `$${stock.high.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500 hidden sm:table-cell price-text">
                    {stock.low ? `$${stock.low.toFixed(2)}` : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
