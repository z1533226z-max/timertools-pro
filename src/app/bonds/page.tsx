import type { Metadata } from 'next';
import BondList from '@/components/market/BondList';
import AdBanner from '@/components/ads/AdBanner';
import { DISCLAIMER_TEXT } from '@/lib/constants';

export const metadata: Metadata = {
  title: '채권 수익률 - 국고채, 회사채 금리',
  description: '국고채 3년/5년/10년, 회사채 수익률을 확인하세요. 채권 시장 동향과 금리 정보를 제공합니다.',
  keywords: ['채권 수익률', '국고채 금리', '회사채 금리', '국채 수익률', '채권 시세'],
};

export default function BondsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">채권 수익률</h1>
        <p className="text-sm text-gray-500">국고채, 회사채 수익률 및 금리 동향</p>
      </div>

      <AdBanner className="mb-6" format="horizontal" />

      <BondList />

      <AdBanner className="my-6" format="horizontal" />

      <section className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">채권 수익률 안내</h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-2">
          <p>
            채권 수익률은 채권에 투자했을 때 얻을 수 있는 연간 수익률을 의미합니다.
            채권 가격과 수익률은 반비례 관계로, 금리가 오르면 채권 가격은 내리고 수익률은 올라갑니다.
          </p>
          <p>
            국고채 3년물 금리는 한국은행 기준금리의 방향성을 가늠하는 지표로 활용되며,
            국고채 10년물과 3년물의 금리 차이(장단기 금리차)는 경기 전망을 반영합니다.
          </p>
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center mt-6">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
