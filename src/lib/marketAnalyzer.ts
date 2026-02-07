import { MarketSummaryData, GoldSilverData, CryptoData } from '@/types/market';

function getTrendWord(changePercent: number): string {
  if (changePercent > 2) return '급등';
  if (changePercent > 1) return '상승';
  if (changePercent > 0.3) return '소폭 상승';
  if (changePercent > -0.3) return '보합';
  if (changePercent > -1) return '소폭 하락';
  if (changePercent > -2) return '하락';
  return '급락';
}

function getSentiment(changePercent: number): string {
  if (changePercent > 1.5) return '매수세가 강하게 유입되며 강세장을 연출했습니다.';
  if (changePercent > 0.5) return '투자 심리가 개선되며 상승 흐름을 보였습니다.';
  if (changePercent > -0.5) return '뚜렷한 방향성 없이 보합세를 유지했습니다.';
  if (changePercent > -1.5) return '차익 실현 매물이 출회되며 약세를 보였습니다.';
  return '외국인과 기관의 동반 매도세에 하락 압력이 거셌습니다.';
}

export function generateKospiAnalysis(data: MarketSummaryData): string {
  const trend = getTrendWord((data.kospiChange / data.kospiIndex) * 100);
  const percent = ((data.kospiChange / data.kospiIndex) * 100).toFixed(2);
  const sign = data.kospiChange > 0 ? '+' : '';

  return `오늘 코스피 지수는 전일 대비 ${sign}${data.kospiChange.toFixed(2)}포인트(${sign}${percent}%) ${trend}한 ${data.kospiIndex.toFixed(2)}에 마감했습니다. ${getSentiment(parseFloat(percent))}`;
}

export function generateKosdaqAnalysis(data: MarketSummaryData): string {
  const trend = getTrendWord((data.kosdaqChange / data.kosdaqIndex) * 100);
  const percent = ((data.kosdaqChange / data.kosdaqIndex) * 100).toFixed(2);
  const sign = data.kosdaqChange > 0 ? '+' : '';

  return `코스닥 지수는 ${sign}${data.kosdaqChange.toFixed(2)}포인트(${sign}${percent}%) ${trend}한 ${data.kosdaqIndex.toFixed(2)}를 기록했습니다. ${getSentiment(parseFloat(percent))}`;
}

export function generateGoldAnalysis(data: GoldSilverData): string {
  const trend = getTrendWord(data.goldChangePercent);
  const sign = data.goldChangePercent > 0 ? '+' : '';
  const reason =
    data.goldChangePercent > 0
      ? '안전자산 선호 심리가 강화되며 금값이 상승했습니다.'
      : data.goldChangePercent < 0
        ? '달러 강세와 위험자산 선호 전환으로 금값이 하락했습니다.'
        : '금값은 뚜렷한 방향성 없이 횡보했습니다.';

  return `국제 금 시세는 전일 대비 ${sign}${data.goldChangePercent.toFixed(2)}% ${trend}한 온스당 $${data.goldUsd.toFixed(2)}를 기록했습니다. 원화 기준 금 1돈(3.75g) 가격은 약 ${data.goldPerDon.toLocaleString()}원입니다. ${reason}`;
}

export function generateCryptoAnalysis(cryptos: CryptoData[]): string {
  const btc = cryptos.find((c) => c.symbol === 'BTC');
  if (!btc) return '암호화폐 시장 데이터를 불러오는 중입니다.';

  const trend = getTrendWord(btc.changePercent);
  const sign = btc.changePercent > 0 ? '+' : '';

  const topGainer = [...cryptos].sort((a, b) => b.changePercent - a.changePercent)[0];
  const topLoser = [...cryptos].sort((a, b) => a.changePercent - b.changePercent)[0];

  let analysis = `비트코인은 전일 대비 ${sign}${btc.changePercent.toFixed(2)}% ${trend}한 ${btc.price.toLocaleString()}원에 거래되고 있습니다. `;

  if (topGainer && topGainer.changePercent > 0) {
    analysis += `주요 코인 중 ${topGainer.nameKr}(${topGainer.symbol})이 +${topGainer.changePercent.toFixed(2)}%로 가장 높은 상승률을 기록했습니다. `;
  }
  if (topLoser && topLoser.changePercent < 0) {
    analysis += `반면 ${topLoser.nameKr}(${topLoser.symbol})은 ${topLoser.changePercent.toFixed(2)}%로 가장 큰 하락폭을 보였습니다.`;
  }

  return analysis;
}

export function generateDailySummary(
  market: MarketSummaryData,
  goldSilver: GoldSilverData,
  cryptos: CryptoData[]
): string {
  const date = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return `${date} 금융 시장 종합 시황

${generateKospiAnalysis(market)}

${generateKosdaqAnalysis(market)}

${generateGoldAnalysis(goldSilver)}

${generateCryptoAnalysis(cryptos)}

※ 위 내용은 시장 데이터를 기반으로 자동 생성된 분석이며, 투자 권유를 목적으로 하지 않습니다.`;
}
