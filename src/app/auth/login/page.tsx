import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME_KR } from '@/lib/constants';

export const metadata: Metadata = {
  title: '로그인',
};

export default function LoginPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">로그인</h1>
            <p className="text-sm text-gray-500">{SITE_NAME_KR}에 로그인하세요</p>
          </div>

          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                id="email"
                placeholder="이메일을 입력하세요"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <button
              type="button"
              className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              로그인
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            계정이 없으신가요?{' '}
            <Link href="/auth/signup" className="text-primary-600 hover:text-primary-800 font-medium">
              회원가입
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-400 text-center">
            * 회원 시스템은 준비 중입니다. 현재 모든 콘텐츠를 무료로 이용할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
