import { NextResponse } from 'next/server';
import { getGoldSilverData } from '@/lib/api/goldApi';

export async function GET() {
  try {
    const data = await getGoldSilverData();
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
