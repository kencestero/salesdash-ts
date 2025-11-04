import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';         // <-- IMPORTANT for Prisma
export const dynamic = 'force-dynamic';  // no cache

export async function GET() {
  const url = process.env.DATABASE_URL || '';
  const masked =
    url.replace(/:\/\/[^@]+@/, '://***:***@')    // hide user:pass
       .replace(/(\?.*)$/, '');                   // drop query
  try {
    const count = await prisma.trailer.count();
    const sample = await prisma.trailer.findMany({
      take: 3,
      select: { vin: true, length: true, width: true, salePrice: true, manufacturer: true },
      orderBy: { vin: 'asc' }
    });
    return NextResponse.json({ ok: true, db: masked, count, sample });
  } catch (e: any) {
    return NextResponse.json({ ok: false, db: masked, error: e.message });
  }
}
