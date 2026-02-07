import type { Metadata } from 'next';
import { SITE_NAME_KR, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: `${SITE_NAME_KR} 개인정보처리방침`,
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">개인정보처리방침</h1>
      <div className="prose prose-sm text-gray-600 space-y-4">
        <p>
          {SITE_NAME_KR}(이하 &quot;본 사이트&quot;)는 이용자의 개인정보를 중요시하며,
          「개인정보 보호법」을 준수합니다.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">1. 수집하는 개인정보 항목</h2>
        <p>본 사이트는 서비스 제공을 위해 다음과 같은 개인정보를 수집할 수 있습니다:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>이메일 주소 (회원가입 시)</li>
          <li>접속 로그, IP 주소, 쿠키 (자동 수집)</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">2. 개인정보의 수집 및 이용 목적</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>회원 관리 및 서비스 제공</li>
          <li>이용 통계 분석 및 서비스 개선</li>
          <li>광고 게재 (Google AdSense)</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">3. 개인정보의 보유 및 이용 기간</h2>
        <p>
          수집된 개인정보는 회원 탈퇴 시까지 보유하며, 탈퇴 시 지체 없이 파기합니다.
          단, 관계 법령에 의해 보존해야 하는 정보는 해당 기간 동안 보관합니다.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">4. 쿠키(Cookie) 사용</h2>
        <p>
          본 사이트는 Google AdSense 및 Google Analytics를 통해 쿠키를 사용합니다.
          이용자는 브라우저 설정을 통해 쿠키 사용을 거부할 수 있으나,
          일부 서비스 이용에 제한이 있을 수 있습니다.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">5. 제3자 제공</h2>
        <p>본 사이트는 이용자의 개인정보를 제3자에게 제공하지 않습니다.</p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">6. 문의</h2>
        <p>개인정보 관련 문의: {SITE_URL}</p>

        <p className="text-xs text-gray-400 mt-8">시행일: 2025년 1월 1일</p>
      </div>
    </div>
  );
}
