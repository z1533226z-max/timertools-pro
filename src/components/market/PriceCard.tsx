'use client';

import Link from 'next/link';
import { formatPrice, formatPercent, getChangeColor, getArrow, cn } from '@/lib/utils';

interface PriceCardProps {
  title: string;
  price: number;
  changePercent: number;
  change: number;
  currency?: 'KRW' | 'USD';
  href?: string;
  subtitle?: string;
  icon?: string;
}

export default function PriceCard({
  title,
  price,
  changePercent,
  change,
  currency = 'KRW',
  href,
  subtitle,
  icon,
}: PriceCardProps) {
  const colorClass = getChangeColor(changePercent);
  const bgClass = changePercent > 0 ? 'border-red-100' : changePercent < 0 ? 'border-blue-100' : 'border-gray-100';

  const content = (
    <div className={cn(
      'bg-white rounded-xl border-2 p-4 transition-all',
      bgClass,
      href && 'hover:shadow-md cursor-pointer'
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
        {subtitle && (
          <span className="text-xs text-gray-400">{subtitle}</span>
        )}
      </div>
      <div className="text-xl font-bold price-text text-gray-900 mb-1">
        {formatPrice(price, currency)}
      </div>
      <div className={cn('text-sm price-text font-medium', colorClass)}>
        {getArrow(changePercent)} {change > 0 ? '+' : ''}{currency === 'USD' ? `$${Math.abs(change).toFixed(2)}` : Math.round(change).toLocaleString()}
        {' '}({formatPercent(changePercent)})
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
