import type { Metadata } from 'next';
import CryptoList from '@/components/market/CryptoList';
import AdBanner from '@/components/ads/AdBanner';
import { DISCLAIMER_TEXT } from '@/lib/constants';

export const metadata: Metadata = {
  title: '코인 시세 - 비트코인, 이더리움 실시간 가격',
  description: '비트코인, 이더리움, 리플 등 주요 암호화폐 실시간 원화(KRW) 시세를 확인하세요.',
  keywords: ['비트코인 시세', '이더리움 시세', '코인 시세', '암호화폐', 'BTC', 'ETH', '비트코인 가격'],
};

export default function CryptoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">코인 시세</h1>
        <p className="text-sm text-gray-500">주요 암호화폐 실시간 원화(KRW) 시세</p>
      </div>

      <AdBanner className="mb-6" format="horizontal" />

      <CryptoList />

      <AdBanner className="my-6" format="horizontal" />

      <section className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">암호화폐 시세 안내</h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-2">
          <p>
            암호화폐(가상자산)는 블록체인 기술을 기반으로 한 디지털 자산으로,
            비트코인(BTC)이 가장 대표적입니다. 24시간 365일 거래가 가능하며,
            높은 변동성이 특징입니다.
          </p>
          <p>
            표시되는 시세는 국내 거래소(업비트) 또는 CoinGecko 기준 원화(KRW) 가격이며,
            실시간으로 업데이트됩니다.
          </p>
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center mt-6">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
