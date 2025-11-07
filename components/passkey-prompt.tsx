"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePasskey } from '@/lib/hooks/usePasskey';
import { X } from 'lucide-react';

export function PasskeyPrompt() {
  const { data: session } = useSession();
  const { registerPasskey, loading, error } = usePasskey();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user dismissed this session
    if (dismissed || !session?.user?.email) return;

    // Check if already dismissed in localStorage
    const dismissedKey = `passkey-prompt-dismissed-${session.user.email}`;
    if (localStorage.getItem(dismissedKey) === 'true') {
      setDismissed(true);
      return;
    }

    // Check if user has passkeys
    fetch('/api/passkeys/check')
      .then(r => r.json())
      .then(data => {
        if (!data.hasPasskeys) {
          setShow(true);
        }
      })
      .catch(() => {});
  }, [session, dismissed]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    if (session?.user?.email) {
      localStorage.setItem(`passkey-prompt-dismissed-${session.user.email}`, 'true');
    }
  };

  const handleEnable = async () => {
    if (!session?.user?.id || !session?.user?.email) return;

    try {
      const result = await registerPasskey(session.user.id, session.user.email);
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          setShow(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to register passkey:', err);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-6 text-white border border-white/20">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="text-xl font-bold mb-2">Face ID Enabled!</h3>
            <p className="text-white/80 text-sm">
              Next time, just tap your face to login
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">🔐</div>
              <div>
                <h3 className="text-lg font-bold">Enable Face ID Login?</h3>
                <p className="text-white/80 text-sm">Sign in instantly with biometrics</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-lg px-3 py-2 mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleEnable}
                disabled={loading}
                className="flex-1 bg-white text-purple-600 font-semibold py-3 px-4 rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enabling...' : 'Enable Now'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-3 text-white/80 hover:text-white transition-colors text-sm"
              >
                Maybe Later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
