import type { Metadata } from 'next';
import GoldSilverContent from '@/components/market/GoldSilverContent';
import AdBanner from '@/components/ads/AdBanner';
import { DISCLAIMER_TEXT } from '@/lib/constants';

export const metadata: Metadata = {
  title: '금 시세 - 오늘 금값, 금 1돈 가격',
  description: '오늘 금 시세를 실시간으로 확인하세요. 국제 금값(USD), 원화 환산 금 시세, 금 1돈 가격 정보를 제공합니다.',
  keywords: ['금 시세', '금값', '오늘 금 시세', '금 1돈 가격', '금 시세 실시간', '국제 금값'],
};

export default function GoldPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">금 시세</h1>
        <p className="text-sm text-gray-500">국제 금값 및 원화 환산 시세, 금 1돈 가격</p>
      </div>

      <AdBanner className="mb-6" format="horizontal" />

      <GoldSilverContent type="gold" />

      <AdBanner className="my-6" format="horizontal" />

      <section className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">금 시세 안내</h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-2">
          <p>
            금은 대표적인 안전자산으로, 경제 불확실성이 높아질 때 가격이 상승하는 경향이 있습니다.
            국제 금 시세는 트로이온스(oz, 약 31.1g) 단위로 미국 달러(USD)로 표시됩니다.
          </p>
          <p>
            한국에서 금을 거래할 때 자주 사용하는 단위인 &apos;1돈&apos;은 약 3.75g이며,
            금 1돈 가격 = (국제 금값 × 원/달러 환율 × 3.75) ÷ 31.1035 으로 계산됩니다.
          </p>
          <p>
            실제 금 매매 시에는 부가세, 수수료, 프리미엄 등이 추가될 수 있으므로
            위 가격은 참고용으로만 활용하시기 바랍니다.
          </p>
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center mt-6">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
