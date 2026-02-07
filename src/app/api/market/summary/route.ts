import { NextResponse } from 'next/server';
import { getMarketIndex } from '@/lib/api/kisApi';

export async function GET() {
  try {
    const data = await getMarketIndex();
    return NextResponse.json({
      success: true,
      data,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, data: null, updatedAt: new Date().toISOString() },
      { status: 500 }
    );
  }
}
