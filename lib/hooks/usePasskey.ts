import { useState } from 'react';
import * as wb from '@simplewebauthn/browser';
import { signIn } from 'next-auth/react';

export function usePasskey() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loginWithPasskey(email: string, callbackUrl: string = '/en/dashboard') {
    setLoading(true);
    setError(null);

    try {
      // Start authentication
      const start = await fetch('/api/passkeys/auth/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).then(r => r.json());

      if (!start.challenge) {
        throw new Error(start.error || 'No passkeys found for this account');
      }

      // Get credential from browser
      const cred = await wb.startAuthentication(start);
      const credentialId = Buffer.from(cred.rawId).toString('base64url');

      // Finish authentication
      const fin = await fetch('/api/passkeys/auth/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: start.userId, cred, credentialId }),
      }).then(r => r.json());

      if (fin.ok && fin.token) {
        // Sign in with NextAuth using the JWT token
        const result = await signIn('passkey', {
          token: fin.token,
          redirect: false,
        });

        if (result?.ok) {
          window.location.assign(callbackUrl);
        } else {
          throw new Error('Sign-in failed');
        }
      } else {
        throw new Error(fin.error || 'Authentication failed');
      }
    } catch (err: any) {
      console.error('[usePasskey] Login error:', err);
      setError(err.message || 'Passkey sign-in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function registerPasskey(userId: string, email: string) {
    setLoading(true);
    setError(null);

    try {
      // Start registration
      const start = await fetch('/api/passkeys/register/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      }).then(r => r.json());

      // Get credential from browser
      const cred = await wb.startRegistration(start);

      // Finish registration
      const fin = await fetch('/api/passkeys/register/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, cred }),
      }).then(r => r.json());

      if (!fin.ok) {
        throw new Error('Registration failed');
      }

      return true;
    } catch (err: any) {
      console.error('[usePasskey] Registration error:', err);
      setError(err.message || 'Passkey registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    loginWithPasskey,
    registerPasskey,
    loading,
    error,
  };
}
