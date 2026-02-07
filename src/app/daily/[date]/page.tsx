import type { Metadata } from 'next';
import Link from 'next/link';
import DailyReportContent from '@/components/market/DailyReportContent';
import AdBanner from '@/components/ads/AdBanner';
import { DISCLAIMER_TEXT } from '@/lib/constants';

interface Props {
  params: { date: string };
}

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: `${params.date} 금융 시장 종합 시황`,
    description: `${params.date} 코스피, 코스닥, 금, 은, 비트코인, 채권 시장 종합 분석 리포트`,
    keywords: [`${params.date} 시황`, '오늘의 시황', '금융 시장 분석'],
  };
}

export default function DailyDatePage({ params }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/daily" className="text-sm text-primary-600 hover:text-primary-800 mb-2 inline-block">
          ← 시황 목록으로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{params.date} 금융 시장 종합 시황</h1>
        <p className="text-sm text-gray-500">AI가 분석한 오늘의 금융 시장 동향</p>
      </div>

      <AdBanner className="mb-6" format="horizontal" />

      <DailyReportContent date={params.date} />

      <AdBanner className="my-6" format="horizontal" />

      <p className="text-xs text-gray-400 text-center mt-6">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
