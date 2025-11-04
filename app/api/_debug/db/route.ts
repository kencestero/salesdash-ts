// app/api/_debug/db/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const sample = await prisma.trailer.findMany({ take: 3 });
    return NextResponse.json({
      ok: true,
      db: process.env.DATABASE_URL ? 'postgresql://***:***@***/*' : null,
      count: sample.length,
      sample,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
