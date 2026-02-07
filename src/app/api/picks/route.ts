import { NextResponse } from 'next/server';
import { getVolumeRank } from '@/lib/api/kisApi';
import { generatePicks } from '@/lib/stockAnalyzer';
import { withCache } from '@/lib/cache';

export async function GET() {
  try {
    const picks = await withCache('ai-picks', 3600, async () => {
      const [kospiRank, kosdaqRank] = await Promise.all([
        getVolumeRank('KOSPI'),
        getVolumeRank('KOSDAQ'),
      ]);

      const allRank = [...kospiRank, ...kosdaqRank]
        .sort((a, b) => b.volume - a.volume);

      return generatePicks(allRank);
    });

    return NextResponse.json({
      success: true,
      data: picks,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, data: [], updatedAt: new Date().toISOString() },
      { status: 500 }
    );
  }
}
