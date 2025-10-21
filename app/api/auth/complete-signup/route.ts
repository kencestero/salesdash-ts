import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateCodeAndGetRole } from '@/lib/joinCode';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { joinCode } = await req.json();

    if (!joinCode) {
      return NextResponse.json({ error: 'Join code required' }, { status: 400 });
    }

    // Validate join code
    const testCodes: Record<string, string> = {
      'OWNER1': 'owner',
      'MGR001': 'manager',
      'REP001': 'salesperson'
    };

    let role = validateCodeAndGetRole(joinCode);

    // Check test codes if normal validation fails
    if (!role && testCodes[joinCode.toUpperCase()]) {
      role = testCodes[joinCode.toUpperCase()];
    }

    if (!role) {
      return NextResponse.json({ error: 'Invalid join code' }, { status: 400 });
    }

    // Update user profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Update profile to remove needsJoinCode flag and set role
    await prisma.userProfile.update({
      where: { userId: user.id },
      data: {
        needsJoinCode: false,
        member: true,
        role: role as "owner" | "manager" | "salesperson"
      }
    });

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('Error completing signup:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
