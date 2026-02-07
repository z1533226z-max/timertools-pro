export function formatPrice(price: number, currency: 'KRW' | 'USD' = 'KRW'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }
  return new Intl.NumberFormat('ko-KR').format(Math.round(price)) + '원';
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + '억';
  }
  if (num >= 10_000) {
    return (num / 10_000).toFixed(1) + '만';
  }
  return new Intl.NumberFormat('ko-KR').format(num);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatChange(value: number, currency: 'KRW' | 'USD' = 'KRW'): string {
  const sign = value > 0 ? '+' : '';
  if (currency === 'USD') {
    return `${sign}$${Math.abs(value).toFixed(2)}`;
  }
  return `${sign}${new Intl.NumberFormat('ko-KR').format(Math.round(value))}`;
}

export function getChangeColor(value: number): string {
  if (value > 0) return 'text-up';
  if (value < 0) return 'text-down';
  return 'text-flat';
}

export function getChangeBg(value: number): string {
  if (value > 0) return 'bg-red-50';
  if (value < 0) return 'bg-blue-50';
  return 'bg-gray-50';
}

export function getArrow(value: number): string {
  if (value > 0) return '▲';
  if (value < 0) return '▼';
  return '-';
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function isMarketOpen(): boolean {
  const now = new Date();
  const kst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const day = kst.getDay();
  const hour = kst.getHours();
  const minute = kst.getMinutes();
  const time = hour * 60 + minute;
  if (day === 0 || day === 6) return false;
  return time >= 540 && time <= 930; // 09:00 ~ 15:30
}

export function isUSMarketOpen(): boolean {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay();
  const hour = et.getHours();
  const minute = et.getMinutes();
  const time = hour * 60 + minute;
  if (day === 0 || day === 6) return false;
  return time >= 570 && time <= 960; // 09:30 ~ 16:00
}

export function getToday(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
