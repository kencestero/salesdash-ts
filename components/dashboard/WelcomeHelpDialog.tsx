'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

const COOKIE_NAME = 'remotive_welcome_dismissed';

const benefits = [
  {
    title: 'Live Trailer Inventory',
    description: 'Filter, share, price out, and download option lists.',
    icon: 'heroicons:truck',
  },
  {
    title: 'Finance Quotes',
    description: 'Build quotes in seconds with export options.',
    icon: 'heroicons:credit-card',
  },
  {
    title: 'Lease-to-Own',
    description: 'Generate clear payment structures.',
    icon: 'heroicons:document-text',
  },
  {
    title: '3-Option PDF',
    description: 'Branded PDF with three payment options.',
    icon: 'heroicons:document-duplicate',
  },
  {
    title: 'Secure CRM',
    description: 'Lead privacy for every rep.',
    icon: 'heroicons:shield-check',
  },
  {
    title: 'Click-to-Call',
    description: 'Call and email with a single tap.',
    icon: 'heroicons:phone',
  },
  {
    title: 'Team Chat',
    description: 'Chat with colleagues inside the app.',
    icon: 'heroicons:chat-bubble-left-right',
  },
  {
    title: 'Response Timer',
    description: 'Track lead response times live.',
    icon: 'heroicons:clock',
  },
];

// Cookie utilities
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

interface WelcomeHelpDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  manualTrigger?: boolean; // When true, don't auto-show based on cookie
}

export function WelcomeHelpDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  manualTrigger = false
}: WelcomeHelpDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Determine if controlled or uncontrolled
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  // Check cookie on mount and auto-show if not dismissed
  useEffect(() => {
    setMounted(true);
    if (!manualTrigger) {
      const dismissed = getCookie(COOKIE_NAME);
      if (!dismissed) {
        // Small delay for smoother UX
        const timer = setTimeout(() => setInternalOpen(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [manualTrigger]);

  const handleClose = () => {
    if (dontShowAgain) {
      setCookie(COOKIE_NAME, 'true', 365);
    }
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && dontShowAgain) {
      setCookie(COOKIE_NAME, 'true', 365);
    }
    setOpen(newOpen);
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-[1400px] min-w-[900px] p-0 bg-[#131313] border-white/10"
        style={{
          backgroundImage:
            'radial-gradient(circle at top, rgba(233, 97, 20, 0.15), transparent 50%)',
          aspectRatio: '16/9',
        }}
      >
        <div className="px-12 py-8 h-full flex flex-col justify-between">
          <DialogHeader className="mb-6">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
              Remotive
            </p>
            <DialogTitle className="text-3xl font-semibold text-white mt-2">
              Dashboard Tools That Help You Sell More
            </DialogTitle>
            <p className="mt-2 text-base text-gray-400">
              Everything you need in one place.
            </p>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-5 flex-1 content-center">
            {benefits.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="
                  flex flex-col items-center text-center rounded-xl border border-white/10 bg-black/20
                  p-4 transition-all hover:border-orange-500/60 hover:bg-orange-500/10
                "
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/30 mb-2">
                  <Icon icon={item.icon} className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-sm font-semibold text-white leading-tight">{item.title}</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <footer className="mt-6 border-t border-white/10 pt-5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={dontShowAgain}
                  onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                  className="border-white/30 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 h-5 w-5"
                />
                <span className="text-sm text-gray-400">Don't show this again</span>
              </label>

              <Button
                onClick={handleClose}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8"
              >
                Got it!
              </Button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export a function to reset the welcome dialog (show again)
export function resetWelcomeDialog() {
  deleteCookie(COOKIE_NAME);
}

// Export the cookie name for external use
export { COOKIE_NAME as WELCOME_COOKIE_NAME };
