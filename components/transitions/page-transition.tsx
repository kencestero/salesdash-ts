// Page Transition Component for Remotive Logistics CRM
// Professional fade + slide animation with stagger effect

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

// Main page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1], // Custom easing for smooth feel
      when: "beforeChildren",
      staggerChildren: 0.05,
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    }
  }
};

// Content stagger animation for child elements
const contentVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Login-specific animation (more dramatic)
const loginVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    rotateX: -10,
  },
  enter: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  },
  exit: {
    opacity: 0,
    scale: 1.1,
    transition: {
      duration: 0.3,
    }
  }
};

// Page Transition Wrapper Component
export function PageTransition({ 
  children, 
  className = "",
  isLogin = false 
}: { 
  children: ReactNode;
  className?: string;
  isLogin?: boolean;
}) {
  const pathname = usePathname();
  const variants = isLogin ? loginVariants : pageVariants;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
        className={className}
        style={{ transformOrigin: 'top center' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Individual content item animation wrapper
export function ContentItem({ 
  children, 
  delay = 0 
}: { 
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      variants={contentVariants}
      initial="initial"
      animate="enter"
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

// Shared Layout Animation for consistent elements
export function SharedElement({ 
  children, 
  layoutId 
}: { 
  children: ReactNode;
  layoutId: string;
}) {
  return (
    <motion.div
      layoutId={layoutId}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      {children}
    </motion.div>
  );
}

// Remotive Logistics Branded Loading Transition
export function RemotiveLoadingTransition() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1117]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-2xl">RL</span>
        </div>
        <motion.div
          className="absolute inset-0 rounded-lg bg-orange-500"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// Usage Examples:

/* 
1. WRAP YOUR PAGES:
==================
// In your layout.tsx or page component:

import { PageTransition } from '@/components/transitions/page-transition';

export default function DashboardLayout({ children }) {
  return (
    <PageTransition>
      <div className="dashboard-content">
        {children}
      </div>
    </PageTransition>
  );
}

2. FOR LOGIN PAGE (More dramatic):
===================================
import { PageTransition } from '@/components/transitions/page-transition';

export default function LoginPage() {
  return (
    <PageTransition isLogin={true}>
      <div className="login-container">
        <ContentItem delay={0.1}>
          <h1>Welcome to Remotive Logistics</h1>
        </ContentItem>
        <ContentItem delay={0.2}>
          <LoginForm />
        </ContentItem>
      </div>
    </PageTransition>
  );
}

3. FOR INDIVIDUAL ELEMENTS:
===========================
import { ContentItem } from '@/components/transitions/page-transition';

// Stagger animation for list items
{customers.map((customer, index) => (
  <ContentItem key={customer.id} delay={index * 0.05}>
    <CustomerCard customer={customer} />
  </ContentItem>
))}

4. FOR SHARED ELEMENTS (Like logos that persist):
==================================================
import { SharedElement } from '@/components/transitions/page-transition';

// This will smoothly animate between pages
<SharedElement layoutId="mj-logo">
  <Logo />
</SharedElement>

*/