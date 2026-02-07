'use client';

interface PremiumGateProps {
  children: React.ReactNode;
  locked?: boolean;
}

export default function PremiumGate({ children, locked = false }: PremiumGateProps) {
  if (!locked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="premium-blur">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center max-w-sm mx-4">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">프리미엄 콘텐츠</h3>
          <p className="text-sm text-gray-500 mb-4">
            전체 AI 추천 종목을 보려면 로그인이 필요합니다.
          </p>
          <button className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
}
