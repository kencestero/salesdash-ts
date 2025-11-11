import { NextResponse } from 'next/server';
import { getLocationByZip } from '@/lib/data/zip-tax-map';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const zip = (searchParams.get('zip') || '').slice(0, 5);

  if (!zip || zip.length !== 5) {
    return NextResponse.json({ rate: 0 });
  }

  // Use existing ZIP tax map
  const location = getLocationByZip(zip);
  const rate = location?.tax ?? 0;

  return NextResponse.json({ rate });
}
