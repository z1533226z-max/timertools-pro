import type { Metadata } from 'next';
import PicksList from '@/components/picks/PicksList';
import AdBanner from '@/components/ads/AdBanner';
import { DISCLAIMER_TEXT } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'AI 종목 추천 - 오늘의 추천 종목',
  description: 'AI가 분석한 오늘의 추천 종목을 확인하세요. 매수가, 목표가, 손절가와 함께 상세한 추천 이유를 제공합니다.',
  keywords: ['AI 종목 추천', '주식 추천', '매수 종목', '목표가', '손절가', '주식 분석'],
};

export default function PicksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">AI 종목 추천</h1>
          <span className="px-3 py-1 bg-red-50 text-red-600 text-sm font-semibold rounded-full">HOT</span>
        </div>
        <p className="text-sm text-gray-500">거래량, 기술적 지표를 종합 분석하여 매일 추천 종목을 선정합니다</p>
      </div>

      {/* 면책 안내 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>투자 유의사항:</strong> 본 추천은 AI 알고리즘이 기술적 지표를 분석한 결과이며,
          투자 권유를 목적으로 하지 않습니다. 투자에 대한 최종 결정과 그에 따른 손익은 투자자 본인에게 있습니다.
        </p>
      </div>

      <AdBanner className="mb-6" format="horizontal" />

      <PicksList />

      <AdBanner className="my-6" format="horizontal" />

      <section className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">AI 종목 추천 분석 방법</h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-2">
          <p>
            GON 금융의 AI 종목 추천은 다음과 같은 기술적 지표를 종합 분석하여 매일 3~5개의 추천 종목을 선정합니다:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>거래량 급증 종목 탐지 (전일 대비 거래량 변화율 분석)</li>
            <li>이동평균선(5일/20일) 기반 추세 판단</li>
            <li>등락률 및 가격 모멘텀 분석</li>
            <li>매수가, 목표가(수익 실현), 손절가(손실 제한) 자동 산출</li>
          </ul>
          <p>
            각 추천에는 구체적인 분석 이유가 함께 제공되며, 매일 장 시작 전에 업데이트됩니다.
          </p>
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center mt-6">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
