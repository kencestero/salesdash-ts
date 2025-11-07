import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { prisma } from '@/lib/prisma';
import { createPasskeyJWT } from '@/lib/passkey-jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, cred, credentialId } = body;

    if (!userId || !cred) {
      return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.currentChallenge) {
      return NextResponse.json({ ok: false, error: 'no-challenge' }, { status: 400 });
    }

    // Find the credential in database
    const dbCred = await prisma.webAuthnCredential.findFirst({
      where: {
        userId: user.id,
        credentialId: credentialId || Buffer.from(cred.rawId).toString('base64url')
      }
    });

    if (!dbCred) {
      return NextResponse.json({ ok: false, error: 'credential-not-found' }, { status: 404 });
    }

    const rpID = process.env.PASSKEY_RP_ID || 'mjsalesdash.com';
    const expectedOrigin = process.env.PASSKEY_ORIGIN || 'https://mjsalesdash.com';

    const verification = await verifyAuthenticationResponse({
      response: cred,
      expectedRPID: rpID,
      expectedOrigin,
      expectedChallenge: user.currentChallenge,
      authenticator: {
        credentialID: Buffer.from(dbCred.credentialId, 'base64url'),
        credentialPublicKey: Buffer.from(dbCred.publicKey, 'base64url'),
        counter: dbCred.counter,
      },
    });

    if (!verification.verified) {
      return NextResponse.json({ ok: false, error: 'verification-failed' }, { status: 401 });
    }

    // Update counter
    await prisma.webAuthnCredential.update({
      where: { id: dbCred.id },
      data: { counter: verification.authenticationInfo.newCounter }
    });

    // Clear challenge
    await prisma.user.update({
      where: { id: user.id },
      data: { currentChallenge: null }
    });

    // Issue one-time JWT for NextAuth "passkey" provider
    const token = await createPasskeyJWT(user.id);

    return NextResponse.json({
      ok: true,
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error: any) {
    console.error('[passkeys/auth/finish] Error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
