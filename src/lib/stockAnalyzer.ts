import { StockPick, VolumeRankItem } from '@/types/market';

interface AnalysisInput {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume?: number;
  market: 'KOSPI' | 'KOSDAQ';
}

function calculateTargetPrice(price: number, changePercent: number, volumeRatio: number): number {
  let targetPercent = 5;
  if (changePercent > 3) targetPercent = 8;
  else if (changePercent > 1) targetPercent = 6;
  if (volumeRatio > 3) targetPercent += 2;
  return Math.round(price * (1 + targetPercent / 100));
}

function calculateStopLoss(price: number, changePercent: number): number {
  let stopPercent = 3;
  if (changePercent > 5) stopPercent = 5;
  else if (changePercent > 2) stopPercent = 4;
  return Math.round(price * (1 - stopPercent / 100));
}

function calculateBuyPrice(price: number, changePercent: number): number {
  if (changePercent > 3) return Math.round(price * 0.98);
  if (changePercent > 1) return Math.round(price * 0.99);
  return price;
}

function generateReason(input: AnalysisInput, volumeRatio: number): string {
  const reasons: string[] = [];

  if (volumeRatio > 2) {
    reasons.push(`거래량이 평균 대비 ${(volumeRatio * 100).toFixed(0)}% 급증하며 강한 매수세가 유입되고 있습니다`);
  } else if (volumeRatio > 1.5) {
    reasons.push(`거래량이 평균 대비 ${(volumeRatio * 100).toFixed(0)}% 증가하며 관심이 집중되고 있습니다`);
  }

  if (input.changePercent > 3) {
    reasons.push('강한 상승 모멘텀이 형성되어 추가 상승이 기대됩니다');
  } else if (input.changePercent > 1) {
    reasons.push('상승 추세가 지속되며 단기 매수 기회로 판단됩니다');
  } else if (input.changePercent > 0) {
    reasons.push('소폭 상승세를 보이며 안정적인 흐름을 유지하고 있습니다');
  }

  if (input.market === 'KOSDAQ' && input.changePercent > 2) {
    reasons.push('코스닥 시장에서 테마주로 부상하며 단기 급등 가능성이 있습니다');
  }

  if (reasons.length === 0) {
    reasons.push('기술적 지표상 매수 신호가 포착되었습니다');
  }

  return reasons.join('. ') + '.';
}

function getTrend(changePercent: number): 'bullish' | 'bearish' | 'neutral' {
  if (changePercent > 0.5) return 'bullish';
  if (changePercent < -0.5) return 'bearish';
  return 'neutral';
}

export function analyzeStock(input: AnalysisInput): StockPick {
  const avgVolume = input.avgVolume || input.volume * 0.7;
  const volumeRatio = input.volume / avgVolume;
  const buyPrice = calculateBuyPrice(input.price, input.changePercent);
  const targetPrice = calculateTargetPrice(input.price, input.changePercent, volumeRatio);
  const stopLoss = calculateStopLoss(input.price, input.changePercent);

  return {
    id: `${input.code}-${new Date().toISOString().split('T')[0]}`,
    date: new Date().toISOString().split('T')[0],
    code: input.code,
    name: input.name,
    market: input.market,
    currentPrice: input.price,
    buyPrice,
    targetPrice,
    stopLoss,
    reason: generateReason(input, volumeRatio),
    indicators: {
      volumeChange: volumeRatio * 100,
      trend: getTrend(input.changePercent),
    },
    createdAt: new Date().toISOString(),
  };
}

export function generatePicks(volumeRank: VolumeRankItem[]): StockPick[] {
  const candidates = volumeRank
    .filter((item) => item.changePercent > 0 && item.volume > 100000)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  if (candidates.length === 0) {
    return volumeRank.slice(0, 3).map((item) =>
      analyzeStock({
        code: item.code,
        name: item.name,
        price: item.price,
        change: item.change,
        changePercent: item.changePercent,
        volume: item.volume,
        market: item.market,
      })
    );
  }

  return candidates.map((item) =>
    analyzeStock({
      code: item.code,
      name: item.name,
      price: item.price,
      change: item.change,
      changePercent: item.changePercent,
      volume: item.volume,
      market: item.market,
    })
  );
}
