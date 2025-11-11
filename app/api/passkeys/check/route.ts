import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ hasPasskeys: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { credentials: true }
    });

    return NextResponse.json({
      hasPasskeys: (user?.credentials?.length || 0) > 0,
      count: user?.credentials?.length || 0
    });
  } catch (error: any) {
    console.error('[passkeys/check] Error:', error);
    return NextResponse.json({ hasPasskeys: false, error: error.message }, { status: 500 });
  }
}
