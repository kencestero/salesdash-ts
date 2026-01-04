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
    description:
      'See live inventory, filter, share, price out, and download option lists for your leads.',
    icon: '🚚',
  },
  {
    title: 'Customizable Finance Quotes',
    description:
      'Build clean finance quotes in seconds with multiple export and share options.',
    icon: '💳',
  },
  {
    title: 'Lease-to-Own Payments',
    description:
      'Generate clear lease-to-own payment structures with ease.',
    icon: '📄',
  },
  {
    title: '3-Option PDF',
    description:
      'Send a modern branded PDF with three payment options to help you close deals.',
    icon: '📑',
  },
  {
    title: 'Simple & Secure CRM',
    description:
      'Easy-to-use CRM with lead privacy for every rep.',
    icon: '🧩',
  },
  {
    title: 'Click-to-Call & Email',
    description:
      'Call and email leads directly with a single tap in Remotive.',
    icon: '📞',
  },
  {
    title: 'Team Chat',
    description:
      'Chat with colleagues inside the built-in Chat section.',
    icon: '💬',
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
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-[#131313] border-white/10"
        style={{
          backgroundImage:
            'radial-gradient(circle at top, rgba(233, 97, 20, 0.18), transparent 60%), radial-gradient(circle at bottom, rgba(255, 140, 0, 0.18), transparent 60%)',
        }}
      >
        <div className="px-6 py-5">
          <DialogHeader className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
              Remotive
            </p>
            <DialogTitle className="text-xl font-semibold text-white">
              Dashboard Tools That Help You Sell More
            </DialogTitle>
            <p className="mt-1 text-xs text-gray-400">
              Everything you need in one place.
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {benefits.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="
                  flex gap-3 rounded-lg border border-white/10 bg-black/20
                  p-3 transition-all hover:border-orange-500/60 hover:bg-orange-500/10
                "
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-500/30 text-lg shrink-0">
                  {item.icon}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <footer className="mt-5 border-t border-white/10 pt-4">
            <p className="text-xs text-gray-400 mb-4">
              The Dashboard is still in development. If something is missing or needs attention,
              let us know in the Help section.{' '}
              <span className="font-semibold text-orange-400">Happy selling!</span>
            </p>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={dontShowAgain}
                  onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                  className="border-white/30 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <span className="text-xs text-gray-400">Don't show this again</span>
              </label>

              <Button
                onClick={handleClose}
                className="bg-orange-500 hover:bg-orange-600 text-white"
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
