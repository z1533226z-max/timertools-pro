'use client';

import { useState, useEffect, useCallback } from 'react';
import { VolumeRankItem } from '@/types/market';
import { formatPrice, formatPercent, formatNumber, getChangeColor, getArrow } from '@/lib/utils';
import { REFRESH_INTERVALS } from '@/lib/constants';

export default function VolumeRankTable() {
  const [data, setData] = useState<VolumeRankItem[]>([]);
  const [market, setMarket] = useState<'KOSPI' | 'KOSDAQ'>('KOSPI');
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/market/volume-rank?market=${market}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setUpdatedAt(json.updatedAt);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [market]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVALS.VOLUME_RANK);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-800">거래량 TOP 10</h2>
          <span className="inline-flex items-center gap-1 text-xs text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            실시간
          </span>
        </div>
        <div className="flex gap-1">
          {(['KOSPI', 'KOSDAQ'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMarket(m)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                market === m
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="table-responsive">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs">
              <th className="px-4 py-2 text-left w-10">#</th>
              <th className="px-4 py-2 text-left">종목명</th>
              <th className="px-4 py-2 text-right">현재가</th>
              <th className="px-4 py-2 text-right">등락률</th>
              <th className="px-4 py-2 text-right hidden sm:table-cell">거래량</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-t border-gray-50">
                  <td colSpan={5} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : (
              data.map((item) => (
                <tr
                  key={item.code}
                  className="border-t border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2.5 text-gray-400 font-medium">{item.rank}</td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.code}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right price-text font-medium">
                    {formatPrice(item.price)}
                  </td>
                  <td className={`px-4 py-2.5 text-right price-text font-medium ${getChangeColor(item.changePercent)}`}>
                    <span>{getArrow(item.changePercent)} {formatPercent(item.changePercent)}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500 hidden sm:table-cell">
                    {formatNumber(item.volume)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {updatedAt && (
        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-400 text-right">
          {new Date(updatedAt).toLocaleTimeString('ko-KR')} 기준
        </div>
      )}
    </div>
  );
}
