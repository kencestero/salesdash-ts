import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await prisma.trailer.findMany({
    where: { status: 'available' },
    select: {
      vin: true,
      length: true,
      width: true,
      salePrice: true,
      manufacturer: true,
      model: true,
      id: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Map to expected format with size field
  const mappedItems = items.map(item => ({
    ...item,
    size: `${item.length}x${item.width}`,
    price: item.salePrice,
    make: item.manufacturer
  }));

  return NextResponse.json({ items: mappedItems });
}
