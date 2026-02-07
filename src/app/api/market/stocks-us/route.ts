import { NextResponse } from 'next/server';
import { getUSStocks } from '@/lib/api/finnhub';

export async function GET() {
  try {
    const data = await getUSStocks();
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
