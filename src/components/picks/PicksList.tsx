'use client';

import { useState, useEffect } from 'react';
import { StockPick } from '@/types/market';
import PickCard from './PickCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function PicksList() {
  const [picks, setPicks] = useState<StockPick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPicks() {
      try {
        const res = await fetch('/api/picks');
        const json = await res.json();
        if (json.success) setPicks(json.data);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchPicks();
  }, []);

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  if (picks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-400">추천 종목을 분석 중입니다. 잠시 후 다시 확인해주세요.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {picks.map((pick) => (
        <PickCard key={pick.id} pick={pick} />
      ))}
    </div>
  );
}
