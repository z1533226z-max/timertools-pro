import { Suspense } from 'react';
import VolumeRankTable from '@/components/market/VolumeRankTable';
import HomePriceCards from '@/components/market/HomePriceCards';
import HomePicksPreview from '@/components/picks/HomePicksPreview';
import HomeUSStocks from '@/components/market/HomeUSStocks';
import AdBanner from '@/components/ads/AdBanner';
import { LoadingCard } from '@/components/ui/LoadingSpinner';
import { SUB_SITES, DISCLAIMER_TEXT } from '@/lib/constants';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 상단 시세 카드 */}
      <section className="mb-6">
        <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-5 gap-3">{Array.from({length: 5}).map((_, i) => <LoadingCard key={i} />)}</div>}>
          <HomePriceCards />
        </Suspense>
      </section>

      {/* 광고 */}
      <AdBanner className="mb-6" format="horizontal" />

      {/* 메인 콘텐츠 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 거래량 Top 10 */}
        <div className="lg:col-span-2">
          <VolumeRankTable />
        </div>

        {/* 오른쪽: AI 추천 + 미국 주식 */}
        <div className="space-y-6">
          <Suspense fallback={<LoadingCard />}>
            <HomePicksPreview />
          </Suspense>

          <Suspense fallback={<LoadingCard />}>
            <HomeUSStocks />
          </Suspense>
        </div>
      </div>

      {/* 광고 */}
      <AdBanner className="my-6" format="horizontal" />

      {/* 서브사이트 배너 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {SUB_SITES.map((site) => (
          <a
            key={site.href}
            href={site.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-5 border border-primary-200 hover:shadow-md transition-all"
          >
            <h3 className="font-bold text-primary-800 mb-1">{site.label}</h3>
            <p className="text-sm text-primary-600">{site.description}</p>
          </a>
        ))}
      </section>

      {/* SEO 콘텐츠 */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">GON 금융 - 실시간 금융 시세 종합 플랫폼</h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-3">
          <p>
            GON 금융은 한국 주식(KOSPI/KOSDAQ), 미국 주식(나스닥/S&P500), 금/은 시세,
            암호화폐(비트코인, 이더리움 등), 채권 수익률 등 주요 금융 시장의 실시간 시세를
            한눈에 확인할 수 있는 종합 금융 정보 플랫폼입니다.
          </p>
          <p>
            실시간 거래량 TOP 10을 통해 시장에서 가장 활발하게 거래되는 종목을 빠르게 파악하고,
            AI 기반 종목 추천 기능으로 매수가, 목표가, 손절가와 함께 상세한 분석 이유를 제공합니다.
          </p>
          <p>
            매일 자동 생성되는 시황 분석 리포트를 통해 금융 시장의 흐름을 쉽고 빠르게 이해할 수 있습니다.
          </p>
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center mb-4">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
