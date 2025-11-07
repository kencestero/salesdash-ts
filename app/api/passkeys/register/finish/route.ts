import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, cred } = body;

    if (!userId || !cred) {
      return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.currentChallenge) {
      return NextResponse.json({ ok: false, error: 'no-challenge' }, { status: 400 });
    }

    const rpID = process.env.PASSKEY_RP_ID || 'mjsalesdash.com';
    const expectedOrigin = process.env.PASSKEY_ORIGIN || 'https://mjsalesdash.com';

    const verification = await verifyRegistrationResponse({
      response: cred,
      expectedChallenge: user.currentChallenge,
      expectedOrigin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ ok: false, error: 'verification-failed' }, { status: 400 });
    }

    const { registrationInfo } = verification;

    // Store credential in database
    await prisma.webAuthnCredential.create({
      data: {
        userId: user.id,
        credentialId: Buffer.from(registrationInfo.credential.id).toString('base64url'),
        publicKey: Buffer.from(registrationInfo.credential.publicKey).toString('base64url'),
        counter: registrationInfo.credential.counter,
        deviceType: registrationInfo.credentialDeviceType,
        backedUp: registrationInfo.credentialBackedUp,
        transports: JSON.stringify(cred?.response?.transports ?? []),
      }
    });

    // Clear challenge
    await prisma.user.update({
      where: { id: user.id },
      data: { currentChallenge: null }
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[passkeys/register/finish] Error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
