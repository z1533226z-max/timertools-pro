'use client';

import { StockPick } from '@/types/market';
import { formatPrice, getChangeColor, cn } from '@/lib/utils';

interface PickCardProps {
  pick: StockPick;
  blurred?: boolean;
}

export default function PickCard({ pick, blurred = false }: PickCardProps) {
  const targetReturn = ((pick.targetPrice - pick.buyPrice) / pick.buyPrice * 100).toFixed(1);
  const stopReturn = ((pick.stopLoss - pick.buyPrice) / pick.buyPrice * 100).toFixed(1);

  return (
    <div className={cn(
      'bg-white rounded-xl border border-gray-200 shadow-sm p-5 transition-all hover:shadow-md',
      blurred && 'premium-blur'
    )}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{pick.name}</h3>
          <span className="text-xs text-gray-400">{pick.code} | {pick.market}</span>
        </div>
        <div className={cn(
          'px-3 py-1 rounded-full text-xs font-semibold',
          pick.indicators.trend === 'bullish'
            ? 'bg-red-50 text-red-600'
            : pick.indicators.trend === 'bearish'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-gray-100 text-gray-600'
        )}>
          {pick.indicators.trend === 'bullish' ? '강세' : pick.indicators.trend === 'bearish' ? '약세' : '중립'}
        </div>
      </div>

      <div className="text-2xl font-bold price-text text-gray-900 mb-4">
        {formatPrice(pick.currentPrice)}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-xs text-green-600 font-medium mb-1">매수가</div>
          <div className="text-sm font-bold text-green-700 price-text">
            {formatPrice(pick.buyPrice)}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-xs text-red-600 font-medium mb-1">목표가</div>
          <div className="text-sm font-bold text-red-700 price-text">
            {formatPrice(pick.targetPrice)}
          </div>
          <div className="text-xs text-red-500">+{targetReturn}%</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-xs text-blue-600 font-medium mb-1">손절가</div>
          <div className="text-sm font-bold text-blue-700 price-text">
            {formatPrice(pick.stopLoss)}
          </div>
          <div className="text-xs text-blue-500">{stopReturn}%</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-xs font-semibold text-gray-600 mb-1">AI 추천 이유</div>
        <p className="text-sm text-gray-700 leading-relaxed">{pick.reason}</p>
      </div>

      {pick.indicators.volumeChange && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <span>거래량 변화:</span>
          <span className={getChangeColor(pick.indicators.volumeChange - 100)}>
            {pick.indicators.volumeChange.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}
