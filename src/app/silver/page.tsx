import type { Metadata } from 'next';
import GoldSilverContent from '@/components/market/GoldSilverContent';
import AdBanner from '@/components/ads/AdBanner';
import { DISCLAIMER_TEXT } from '@/lib/constants';

export const metadata: Metadata = {
  title: '은 시세 - 오늘 은값 실시간',
  description: '오늘 은 시세를 실시간으로 확인하세요. 국제 은값(USD)과 원화 환산 은 시세 정보를 제공합니다.',
  keywords: ['은 시세', '은값', '오늘 은 시세', '은 시세 실시간', '국제 은값'],
};

export default function SilverPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">은 시세</h1>
        <p className="text-sm text-gray-500">국제 은값 및 원화 환산 시세</p>
      </div>

      <AdBanner className="mb-6" format="horizontal" />

      <GoldSilverContent type="silver" />

      <AdBanner className="my-6" format="horizontal" />

      <section className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">은 시세 안내</h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-2">
          <p>
            은은 금과 함께 대표적인 귀금속으로, 산업용 수요(전자기기, 태양광 패널 등)와
            투자 수요가 함께 가격에 영향을 미칩니다.
          </p>
          <p>
            국제 은 시세는 트로이온스(oz) 단위로 미국 달러(USD)로 표시되며,
            금 대비 가격 비율(금은비)은 투자 판단의 참고 지표로 활용됩니다.
          </p>
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center mt-6">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
