'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
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
    href: '/en/inventory',
  },
  {
    title: 'Finance Quotes',
    description: 'Build quotes in seconds with export options.',
    icon: 'heroicons:credit-card',
    href: '/en/finance/compare',
  },
  {
    title: 'Lease-to-Own',
    description: 'Generate clear payment structures.',
    icon: 'heroicons:document-text',
    href: '/en/finance/compare',
  },
  {
    title: '3-Option PDF',
    description: 'Branded PDF with three payment options.',
    icon: 'heroicons:document-duplicate',
    href: '/en/finance/compare',
  },
  {
    title: 'Secure CRM',
    description: 'Lead privacy for every rep.',
    icon: 'heroicons:shield-check',
    href: '/en/crm/customers',
  },
  {
    title: 'Click-to-Call',
    description: 'Call and email with a single tap.',
    icon: 'heroicons:phone',
    href: '/en/crm/customers',
  },
  {
    title: 'Team Chat',
    description: 'Chat with colleagues inside the app.',
    icon: 'heroicons:chat-bubble-left-right',
    href: '/en/chat',
  },
  {
    title: 'Response Timer',
    description: 'Track lead response times live.',
    icon: 'heroicons:clock',
    href: '/en/crm/customers',
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
  const router = useRouter();
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

  // Handle card click - navigate to page and close dialog
  const handleCardClick = (href: string) => {
    if (dontShowAgain) {
      setCookie(COOKIE_NAME, 'true', 365);
    }
    setOpen(false);
    router.push(href);
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-[1400px] p-0 bg-[#131313] border-white/10 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundImage:
            'radial-gradient(circle at top, rgba(233, 97, 20, 0.15), transparent 50%)',
        }}
      >
        <div className="px-4 sm:px-8 lg:px-12 py-4 sm:py-6 lg:py-8 flex flex-col">
          <DialogHeader className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-orange-400">
              Remotive
            </p>
            <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mt-2">
              Dashboard Tools That Help You Sell More
            </DialogTitle>
            <p className="mt-2 text-sm sm:text-base text-gray-400">
              Everything you need in one place.
            </p>
          </DialogHeader>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {benefits.map((item, index) => (
              <motion.button
                key={item.title}
                onClick={() => handleCardClick(item.href)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="
                  flex flex-col items-center text-center rounded-xl border border-white/10 bg-black/20
                  p-3 sm:p-4 transition-all hover:border-orange-500/60 hover:bg-orange-500/10
                  cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500
                "
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-orange-500/30 mb-2">
                  <Icon icon={item.icon} className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-white leading-tight">{item.title}</h3>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1 leading-relaxed">{item.description}</p>
              </motion.button>
            ))}
          </div>

          <footer className="mt-4 sm:mt-6 border-t border-white/10 pt-4 sm:pt-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 w-full sm:w-auto"
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
