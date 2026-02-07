'use client';

import { useState, useEffect } from 'react';
import { CryptoData } from '@/types/market';
import { formatPrice, formatPercent, formatNumber, getChangeColor, getArrow } from '@/lib/utils';
import { REFRESH_INTERVALS } from '@/lib/constants';

export default function CryptoList() {
  const [data, setData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/market/crypto');
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVALS.CRYPTO);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <h2 className="text-base font-bold text-gray-800">주요 암호화폐</h2>
        <span className="text-xs text-gray-400">1분 간격 업데이트</span>
      </div>

      <div className="table-responsive">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs">
              <th className="px-4 py-2 text-left">코인</th>
              <th className="px-4 py-2 text-right">현재가</th>
              <th className="px-4 py-2 text-right">등락률 (24h)</th>
              <th className="px-4 py-2 text-right hidden sm:table-cell">거래대금 (24h)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-t border-gray-50">
                  <td colSpan={4} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : (
              data.map((coin) => (
                <tr key={coin.symbol} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{coin.nameKr}</div>
                    <div className="text-xs text-gray-400">{coin.symbol}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium price-text">
                    {formatPrice(coin.price)}
                  </td>
                  <td className={`px-4 py-3 text-right price-text font-medium ${getChangeColor(coin.changePercent)}`}>
                    {getArrow(coin.changePercent)} {formatPercent(coin.changePercent)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 hidden sm:table-cell">
                    {coin.volume24h ? formatNumber(coin.volume24h) + '원' : '-'}
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
