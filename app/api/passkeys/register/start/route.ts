import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 });
    }

    // Fetch existing credentials to exclude
    const creds = await prisma.webAuthnCredential.findMany({ where: { userId } });

    const rpID = process.env.PASSKEY_RP_ID || 'mjsalesdash.com';

    const opts = await generateRegistrationOptions({
      rpName: 'MJ SalesDash',
      rpID,
      userID: new TextEncoder().encode(userId),
      userName: email,
      attestationType: 'none',
      excludeCredentials: creds.map(c => ({
        id: Buffer.from(c.credentialId, 'base64url'),
        type: 'public-key' as const
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred'
      },
    });

    // Store challenge in user record
    await prisma.user.update({
      where: { id: userId },
      data: { currentChallenge: opts.challenge }
    });

    return NextResponse.json(opts);
  } catch (error: any) {
    console.error('[passkeys/register/start] Error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
