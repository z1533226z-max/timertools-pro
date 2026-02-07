import { NextResponse } from 'next/server';
import { getBondData } from '@/lib/api/publicData';

export async function GET() {
  try {
    const data = await getBondData();
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
