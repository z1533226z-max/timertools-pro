import { cn, formatPercent, formatChange, getChangeColor, getArrow } from '@/lib/utils';

interface TrendIndicatorProps {
  change: number;
  changePercent: number;
  currency?: 'KRW' | 'USD';
  size?: 'sm' | 'md' | 'lg';
  showArrow?: boolean;
}

export default function TrendIndicator({
  change,
  changePercent,
  currency = 'KRW',
  size = 'md',
  showArrow = true,
}: TrendIndicatorProps) {
  const colorClass = getChangeColor(changePercent);
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <span className={cn('price-text font-medium inline-flex items-center gap-1', colorClass, sizeClasses[size])}>
      {showArrow && <span>{getArrow(changePercent)}</span>}
      <span>{formatChange(change, currency)}</span>
      <span>({formatPercent(changePercent)})</span>
    </span>
  );
}
