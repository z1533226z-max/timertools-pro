import { NextRequest, NextResponse } from 'next/server';
import { getVolumeRank, getMarketIndex } from '@/lib/api/kisApi';

export async function GET(request: NextRequest) {
  const market = request.nextUrl.searchParams.get('market') === 'KOSDAQ' ? 'KOSDAQ' : 'KOSPI';

  try {
    const [volumeRank, marketIndex] = await Promise.all([
      getVolumeRank(market),
      getMarketIndex(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        volumeRank,
        marketIndex,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, data: null, updatedAt: new Date().toISOString() },
      { status: 500 }
    );
  }
}
