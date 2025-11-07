import { jwtVerify, SignJWT } from 'jose';

const secret = new TextEncoder().encode(process.env.PASSKEY_JWT_SECRET!);

export async function verifyPasskeyJWT(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload as any).uid as string || null;
  } catch (error) {
    console.error('[passkey-jwt] Verification failed:', error);
    return null;
  }
}

export async function createPasskeyJWT(userId: string): Promise<string> {
  return await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('5m')
    .sign(secret);
}
