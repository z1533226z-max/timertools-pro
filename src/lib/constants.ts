export const SITE_NAME = 'GON Finance';
export const SITE_NAME_KR = 'GON 금융';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gon.ai.kr';
export const SITE_DESCRIPTION = '실시간 금융 시세와 AI 종목 추천 - 주식, 금, 은, 코인, 채권 시세를 한눈에';

export const ADSENSE_CLIENT_ID = 'ca-pub-7479840445702290';

export const NAV_ITEMS = [
  { href: '/', label: '홈', labelShort: '홈' },
  { href: '/stocks', label: '한국주식', labelShort: '주식' },
  { href: '/stocks/us', label: '미국주식', labelShort: '미국' },
  { href: '/crypto', label: '코인', labelShort: '코인' },
  { href: '/gold', label: '금 시세', labelShort: '금' },
  { href: '/silver', label: '은 시세', labelShort: '은' },
  { href: '/bonds', label: '채권', labelShort: '채권' },
  { href: '/picks', label: 'AI추천', labelShort: 'AI' },
  { href: '/daily', label: '시황', labelShort: '시황' },
] as const;

export const SUB_SITES = [
  { href: 'https://lotto.gon.ai.kr', label: '로또킹', description: 'AI 로또번호 추천' },
  { href: 'https://saju.gon.ai.kr', label: '사주팔자', description: '무료 사주풀이' },
] as const;

export const US_STOCKS = [
  { symbol: 'AAPL', name: '애플' },
  { symbol: 'TSLA', name: '테슬라' },
  { symbol: 'NVDA', name: '엔비디아' },
  { symbol: 'MSFT', name: '마이크로소프트' },
  { symbol: 'AMZN', name: '아마존' },
  { symbol: 'GOOGL', name: '구글' },
  { symbol: 'META', name: '메타' },
  { symbol: 'NFLX', name: '넷플릭스' },
  { symbol: 'AMD', name: 'AMD' },
  { symbol: 'AVGO', name: '브로드컴' },
] as const;

export const CRYPTO_LIST = [
  { id: 'bitcoin', symbol: 'BTC', name: '비트코인' },
  { id: 'ethereum', symbol: 'ETH', name: '이더리움' },
  { id: 'ripple', symbol: 'XRP', name: '리플' },
  { id: 'solana', symbol: 'SOL', name: '솔라나' },
  { id: 'dogecoin', symbol: 'DOGE', name: '도지코인' },
  { id: 'cardano', symbol: 'ADA', name: '카르다노' },
] as const;

export const REFRESH_INTERVALS = {
  VOLUME_RANK: 10000,
  US_STOCKS: 30000,
  CRYPTO: 60000,
  GOLD_SILVER: 300000,
  BONDS: 3600000,
} as const;

export const DISCLAIMER_TEXT = '본 사이트의 모든 정보는 투자 참고용이며, 투자 권유를 목적으로 하지 않습니다. 투자에 대한 모든 결정과 그에 따른 손실은 투자자 본인에게 있습니다.';
