import type { Metadata } from 'next';
import { SITE_NAME_KR } from '@/lib/constants';

export const metadata: Metadata = {
  title: '투자 면책조항',
  description: `${SITE_NAME_KR} 투자 면책조항 안내`,
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">투자 면책조항</h1>
      <div className="prose prose-sm text-gray-600 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <p className="text-amber-800 font-medium">
            본 사이트에서 제공하는 모든 금융 정보 및 AI 종목 추천은 투자 참고용이며,
            투자 권유를 목적으로 하지 않습니다.
          </p>
        </div>

        <h2 className="text-lg font-semibold text-gray-800">1. 정보의 정확성</h2>
        <p>
          본 사이트에서 제공하는 시세, 지수, 차트 등의 금융 정보는 외부 API 및 데이터 제공자를 통해
          수집된 것으로, 데이터 전송 지연 또는 오류가 발생할 수 있습니다.
          정확한 시세는 해당 거래소 또는 공식 데이터 제공자를 통해 확인하시기 바랍니다.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">2. AI 종목 추천</h2>
        <p>
          AI 종목 추천은 기술적 지표(거래량, 이동평균선, 등락률 등)를 알고리즘으로 분석한 결과이며,
          투자 손익을 보장하지 않습니다. 추천 종목에 대한 투자 결정과 그에 따른 모든 손익은
          투자자 본인에게 있습니다.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">3. 투자 책임</h2>
        <p>
          본 사이트의 정보를 기반으로 한 투자 결정에 대한 모든 책임은 투자자 본인에게 있으며,
          본 사이트는 투자 결과에 대해 어떠한 법적 책임도 지지 않습니다.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">4. 관련 법규</h2>
        <p>
          본 사이트는 「자본시장과 금융투자업에 관한 법률」에 따른 투자자문업 또는
          투자일임업을 영위하지 않습니다.
        </p>

        <p className="text-xs text-gray-400 mt-8">최종 수정일: 2025년 1월 1일</p>
      </div>
    </div>
  );
}
