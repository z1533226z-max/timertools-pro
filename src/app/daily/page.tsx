import type { Metadata } from 'next';
import Link from 'next/link';
import AdBanner from '@/components/ads/AdBanner';
import { DISCLAIMER_TEXT } from '@/lib/constants';
import { getToday } from '@/lib/utils';

export const metadata: Metadata = {
  title: '일일 시황 - 오늘의 금융 시장 분석',
  description: '오늘의 종합 금융 시황을 확인하세요. 주식, 금, 코인, 채권 시장의 동향과 분석을 제공합니다.',
  keywords: ['오늘의 시황', '금융 시황', '주식 시황', '시장 분석', '일일 리포트'],
};

export default function DailyPage() {
  const today = getToday();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">일일 시황</h1>
        <p className="text-sm text-gray-500">매일 자동 생성되는 종합 금융 시장 분석 리포트</p>
      </div>

      <AdBanner className="mb-6" format="horizontal" />

      <div className="space-y-4">
        <Link
          href={`/daily/${today}`}
          className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-full">오늘</span>
            <span className="text-sm text-gray-400">{today}</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">{today} 금융 시장 종합 시황</h2>
          <p className="text-sm text-gray-500">코스피, 코스닥, 금/은, 암호화폐, 채권 종합 분석</p>
        </Link>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-3">시황 리포트란?</h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-2">
          <p>
            GON 금융의 일일 시황 리포트는 매일 금융 시장 데이터를 기반으로 자동 생성되는 분석 자료입니다.
            코스피/코스닥 지수, 금/은 시세, 암호화폐, 채권 수익률 등 주요 시장의 동향을 한눈에 파악할 수 있습니다.
          </p>
          <p>
            각 리포트에는 핵심 포인트 요약, 자산별 상세 분석, 내일 주목할 점 등이 포함되어 있어
            바쁜 투자자들도 빠르게 시장 흐름을 파악할 수 있습니다.
          </p>
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center mt-6">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
