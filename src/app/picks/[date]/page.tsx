import type { Metadata } from 'next';
import Link from 'next/link';
import PicksList from '@/components/picks/PicksList';
import { DISCLAIMER_TEXT } from '@/lib/constants';

interface Props {
  params: { date: string };
}

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: `${params.date} AI 종목 추천`,
    description: `${params.date} AI가 분석한 추천 종목과 적중률을 확인하세요.`,
  };
}

export default function PicksDatePage({ params }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/picks" className="text-sm text-primary-600 hover:text-primary-800 mb-2 inline-block">
          ← AI 종목 추천으로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{params.date} AI 종목 추천</h1>
      </div>

      <PicksList />

      <p className="text-xs text-gray-400 text-center mt-6">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
