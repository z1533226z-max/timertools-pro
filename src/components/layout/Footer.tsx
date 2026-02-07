import Link from 'next/link';
import { SITE_NAME_KR, SUB_SITES, DISCLAIMER_TEXT, NAV_ITEMS } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 사이트 소개 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">{SITE_NAME_KR}</h3>
            <p className="text-sm leading-relaxed">
              실시간 금융 시세, AI 종목 추천, 일일 시황 분석을 제공하는 종합 금융 정보 플랫폼입니다.
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h4 className="text-white font-semibold mb-3">메뉴</h4>
            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* 관련 사이트 */}
          <div>
            <h4 className="text-white font-semibold mb-3">관련 사이트</h4>
            <div className="space-y-2">
              {SUB_SITES.map((site) => (
                <a
                  key={site.href}
                  href={site.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm hover:text-white transition-colors"
                >
                  {site.label} - {site.description}
                </a>
              ))}
            </div>
            <div className="mt-4 space-y-1">
              <Link href="/privacy" className="block text-xs hover:text-white transition-colors">
                개인정보처리방침
              </Link>
              <Link href="/disclaimer" className="block text-xs hover:text-white transition-colors">
                투자 면책조항
              </Link>
            </div>
          </div>
        </div>

        {/* 면책조항 */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500 leading-relaxed">{DISCLAIMER_TEXT}</p>
          <p className="text-xs text-gray-600 mt-4">
            &copy; {new Date().getFullYear()} {SITE_NAME_KR}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
