import { NextRequest, NextResponse } from 'next/server';
import { getVolumeRank } from '@/lib/api/kisApi';

export async function GET(request: NextRequest) {
  const market = request.nextUrl.searchParams.get('market') === 'KOSDAQ' ? 'KOSDAQ' : 'KOSPI';

  try {
    const data = await getVolumeRank(market);
    return NextResponse.json({
      success: true,
      data,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, data: [], updatedAt: new Date().toISOString() },
      { status: 500 }
    );
  }
}
