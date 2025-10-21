import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ needsJoinCode: false });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    });

    return NextResponse.json({
      needsJoinCode: user?.profile?.needsJoinCode || false
    });
  } catch (error) {
    console.error('Error checking user status:', error);
    return NextResponse.json({ needsJoinCode: false });
  }
}
