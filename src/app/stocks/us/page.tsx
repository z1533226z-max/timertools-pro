import type { Metadata } from 'next';
import USStockList from '@/components/market/USStockList';
import AdBanner from '@/components/ads/AdBanner';
import { DISCLAIMER_TEXT } from '@/lib/constants';

export const metadata: Metadata = {
  title: '미국 주식 - 나스닥/S&P500 주요 종목 시세',
  description: '애플, 테슬라, 엔비디아, 마이크로소프트 등 미국 주요 종목 실시간 시세를 확인하세요.',
  keywords: ['미국 주식', '나스닥', 'S&P500', '애플', '테슬라', '엔비디아', 'AAPL', 'TSLA', 'NVDA'],
};

export default function USStocksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">미국 주식 시장</h1>
        <p className="text-sm text-gray-500">나스닥 / S&P500 주요 종목 실시간 시세</p>
      </div>

      <AdBanner className="mb-6" format="horizontal" />

      <USStockList />

      <AdBanner className="my-6" format="horizontal" />

      <section className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">미국 주식 시장 안내</h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-2">
          <p>
            미국 주식 시장은 세계 최대의 금융 시장으로, NYSE(뉴욕증권거래소)와 NASDAQ(나스닥)이 대표적입니다.
            나스닥은 기술주 중심으로 애플, 마이크로소프트, 엔비디아 등 세계적 IT 기업들이 상장되어 있습니다.
          </p>
          <p>
            미국 주식 시장 거래 시간은 한국 시간 기준 오후 11시 30분 ~ 오전 6시(서머타임 적용 시 오후 10시 30분 ~ 오전 5시)입니다.
            표시되는 시세는 15분 지연된 데이터일 수 있습니다.
          </p>
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center mt-6">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
