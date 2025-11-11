import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { prisma } from '@/lib/prisma';
import { getRp } from '@/lib/webauthn/rp';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ ok: false, error: 'missing-email' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return NextResponse.json({ ok: false, error: 'user-not-found' }, { status: 404 });
    }

    const creds = await prisma.webAuthnCredential.findMany({ where: { userId: user.id } });

    if (creds.length === 0) {
      return NextResponse.json({ ok: false, error: 'no-passkeys' }, { status: 404 });
    }

    const { id: rpID } = getRp(req.headers.get('host'));

    const opts = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
      allowCredentials: creds.map(c => ({
        id: Buffer.from(c.credentialId, 'base64url'),
        type: 'public-key' as const
      })),
    });

    // Store challenge
    await prisma.user.update({
      where: { id: user.id },
      data: { currentChallenge: opts.challenge }
    });

    return NextResponse.json({ ...opts, userId: user.id });
  } catch (error: any) {
    console.error('[passkeys/auth/start] Error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
