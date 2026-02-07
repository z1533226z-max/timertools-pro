import type { Metadata } from 'next';
import VolumeRankTable from '@/components/market/VolumeRankTable';
import AdBanner from '@/components/ads/AdBanner';
import { DISCLAIMER_TEXT } from '@/lib/constants';

export const metadata: Metadata = {
  title: '한국 주식 - KOSPI/KOSDAQ 실시간 거래량 순위',
  description: '코스피, 코스닥 실시간 거래량 TOP 10 순위와 주요 종목 시세를 확인하세요. 실시간 업데이트되는 한국 주식 시장 정보를 제공합니다.',
  keywords: ['코스피', '코스닥', '거래량 순위', '주식 시세', '실시간 주식', 'KOSPI', 'KOSDAQ'],
};

export default function StocksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">한국 주식 시장</h1>
        <p className="text-sm text-gray-500">KOSPI / KOSDAQ 실시간 거래량 순위 및 주요 종목 시세</p>
      </div>

      <AdBanner className="mb-6" format="horizontal" />

      <VolumeRankTable />

      <AdBanner className="my-6" format="horizontal" />

      {/* SEO 콘텐츠 */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">한국 주식 시장 안내</h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-2">
          <p>
            한국 주식 시장은 유가증권시장(KOSPI)과 코스닥(KOSDAQ)으로 구분됩니다.
            KOSPI는 대형 우량주 중심, KOSDAQ은 기술주와 성장주 중심의 시장입니다.
          </p>
          <p>
            거래량 순위는 시장 참여자들의 관심이 집중되는 종목을 파악하는 데 유용한 지표입니다.
            거래량이 급증하는 종목은 단기적으로 큰 가격 변동이 나타날 수 있으므로 주의 깊게 관찰해야 합니다.
          </p>
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center mt-6">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
