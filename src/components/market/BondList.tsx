'use client';

import { useState, useEffect } from 'react';
import { BondData } from '@/types/market';
import { getChangeColor, getArrow } from '@/lib/utils';

export default function BondList() {
  const [data, setData] = useState<BondData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/market/bonds');
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-800">채권 수익률</h2>
      </div>

      <div className="table-responsive">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs">
              <th className="px-4 py-2 text-left">채권명</th>
              <th className="px-4 py-2 text-left">만기</th>
              <th className="px-4 py-2 text-right">수익률</th>
              <th className="px-4 py-2 text-right">전일 대비</th>
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
              data.map((bond, index) => (
                <tr key={index} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{bond.name}</td>
                  <td className="px-4 py-3 text-gray-500">{bond.maturity}</td>
                  <td className="px-4 py-3 text-right font-medium price-text">{bond.yield.toFixed(2)}%</td>
                  <td className={`px-4 py-3 text-right price-text ${getChangeColor(bond.change)}`}>
                    {getArrow(bond.change)} {bond.change > 0 ? '+' : ''}{bond.change.toFixed(2)}%p
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
