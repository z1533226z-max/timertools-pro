import { NextResponse } from 'next/server';
import { getUpbitData } from '@/lib/api/upbit';
import { getCryptoData } from '@/lib/api/coinGecko';

export async function GET() {
  try {
    // Upbit 우선 (KRW 원화 실시간), 실패시 CoinGecko
    let data = await getUpbitData();
    if (!data || data.length === 0) {
      data = await getCryptoData();
    }
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
