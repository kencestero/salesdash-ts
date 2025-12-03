'use client';

import { motion } from 'motion/react';

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

export function RemotiveBenefitsCard() {
  const Container: any = motion.section;

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="
        rounded-2xl border border-white/10 bg-[#131313]/70
        px-5 py-6 shadow-xl backdrop-blur-xl text-white
      "
      style={{
        backgroundImage:
          'radial-gradient(circle at top, rgba(233, 97, 20, 0.18), transparent 60%), radial-gradient(circle at bottom, rgba(255, 140, 0, 0.18), transparent 60%)',
      }}
    >
      <header className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
          Remotive
        </p>
        <h2 className="text-xl font-semibold">
          Dashboard Tools That Help You Sell More
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Everything you need in one place.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {benefits.map((item) => (
          <div
            key={item.title}
            className="
              flex gap-3 rounded-lg border border-white/10 bg-black/20
              p-3 transition-all hover:border-orange-500/60 hover:bg-orange-500/10
            "
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-500/30 text-lg">
              {item.icon}
            </div>

            <div>
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="text-xs text-gray-400">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-5 border-t border-white/10 pt-3 text-xs text-gray-400">
        The Dashboard is still in development. If something is missing or needs attention,
        let us know in the Help section.{' '}
        <span className="font-semibold text-orange-400">Happy selling!</span>
      </footer>
    </Container>
  );
}
