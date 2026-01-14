'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

const ONBOARDING_TOKEN_KEY = 'remotive_onboarding_token';
const ONBOARDING_STATE_KEY = 'remotive_rep_onboarding';

interface OnboardingState {
  payplanAccepted: boolean;
  payplanAcceptedAt?: string;
  profileData?: {
    firstName: string;
    lastName: string;
    phone: string;
    state: string;
  };
}

function getOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') {
    return { payplanAccepted: false };
  }
  try {
    const stored = sessionStorage.getItem(ONBOARDING_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse onboarding state:', e);
  }
  return { payplanAccepted: false };
}

function setOnboardingState(state: OnboardingState) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(state));
}

export default function RepPayplanPage() {
  const [accepted, setAccepted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Check if we have a valid token
    const token = sessionStorage.getItem(ONBOARDING_TOKEN_KEY);
    if (!token) {
      // No token - redirect to entry page
      router.push('/onboarding/rep');
      return;
    }
    setHasToken(true);

    // Check if payplan already accepted
    const state = getOnboardingState();
    if (state.payplanAccepted) {
      router.push('/onboarding/rep/w9');
    }
  }, [router]);

  const handleAccept = () => {
    const state = getOnboardingState();
    setOnboardingState({
      ...state,
      payplanAccepted: true,
      payplanAcceptedAt: new Date().toISOString(),
    });
    setAccepted(true);

    // Navigate after brief delay to show success state
    setTimeout(() => {
      router.push('/onboarding/rep/w9');
    }, 1000);
  };

  if (!mounted || !hasToken) {
    return null;
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden relative">
      {/* Background Image - Scrolls with content */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/images/payplan-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          minHeight: "100%",
        }}
      >
        <div className="absolute inset-0 bg-black/60" style={{ minHeight: "100%" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <header className="text-center mb-12">
          <p className="text-orange-500 text-sm font-bold uppercase tracking-[0.3em] mb-4">Remotive Logistics LLC</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Sales Rep Pay Plan</h1>
          <p className="text-white/60 text-lg">Launch Phase | January 2026</p>
        </header>

        {/* 20% Commission Box */}
        <div className="bg-white/5 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-8 mb-8 text-center">
          <p className="text-orange-400 text-sm font-bold uppercase tracking-widest mb-2">Launch Phase Commission</p>
          <div className="text-7xl md:text-8xl font-black text-orange-500 leading-none">20%</div>
          <p className="text-white/70 mt-3 text-lg">of Commissionable Gross Profit</p>
        </div>

        {/* Section 1 - Classification */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-black text-black">1</div>
            <h2 className="text-xl font-bold text-white">Classification</h2>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <p className="text-white/80 leading-relaxed">
              Sales Reps operate as <span className="text-orange-400 font-semibold">independent sales representatives (1099)</span>.
              This is a commission-based role. A W-9 must be filled out and submitted before proceeding to the Remotive Logistics SalesHub (Next Page).
            </p>
          </div>
        </section>

        {/* Section 2 - Commission Structure */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-black text-black">2</div>
            <h2 className="text-xl font-bold text-white">Commission Structure (Launch Phase)</h2>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <p className="text-white/80 mb-4">
              Temporary Commission of <span className="text-orange-400 font-bold">20%</span> of Commissionable Gross Profit (GP) after any fees associated that will hurt the total gross.
            </p>
            <div className="bg-black/30 rounded-lg p-4">
              <p className="text-white/60 text-sm font-semibold mb-3 uppercase tracking-wider">Commissionable Gross Profit (GP) is calculated as:</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-green-500/20 text-green-400 flex items-center justify-center font-bold">+</span>
                  <span className="text-white/80">Sale Price</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-red-500/20 text-red-400 flex items-center justify-center font-bold">−</span>
                  <span className="text-white/80">Trailer Cost</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-red-500/20 text-red-400 flex items-center justify-center font-bold">−</span>
                  <span className="text-white/80">Delivery / transport costs (if paid by the company)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-red-500/20 text-red-400 flex items-center justify-center font-bold">−</span>
                  <span className="text-white/80">Any other direct deal costs or discounts that reduce the trailer&apos;s profit</span>
                </div>
              </div>
              <p className="text-white/50 text-sm mt-4 italic">
                (All costs will be recorded in SalesHub on your Sales Report Tab for the final GP calculation)
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 - When Commission Is Earned */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-black text-black">3</div>
            <h2 className="text-xl font-bold text-white">When Commission Is Earned</h2>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <p className="text-white/80 mb-3">Commission is earned only on deals that are:</p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-3">
                <span className="text-orange-400 mt-1">•</span>
                <span><span className="font-semibold text-white">Funded/paid</span> (cash cleared or lender funding confirmed), and</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400 mt-1">•</span>
                <span><span className="font-semibold text-white">Recorded correctly</span> in SalesHub, and</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400 mt-1">•</span>
                <span>Meet a minimum of <span className="font-semibold text-orange-400">$1,800.00 gross profit</span> requirement for the unit to qualify for Unit Bonus Program.</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-white/70 text-sm">
                <span className="text-orange-400 font-semibold">Note:</span> But you will always get paid on the regular commission cut of <span className="text-white font-semibold">11%</span> from the gross.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 - Payout Schedule */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-black text-black">4</div>
            <h2 className="text-xl font-bold text-white">Payout Schedule (Weekly)</h2>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <p className="text-white/80 mb-4">Commissions are paid <span className="text-orange-400 font-semibold">weekly on Fridays</span> based on funding time:</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <p className="text-white/80 text-sm">Deals funded <span className="text-blue-400 font-semibold">before the weekly cutoff</span> are paid that Friday.</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <p className="text-white/80 text-sm">If a deal is funded on <span className="text-purple-400 font-semibold">Thursday after 1:00 PM (ET)</span> or later, it will be paid on Friday of the following week.</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <p className="text-white/80 text-sm">If funded on <span className="text-green-400 font-semibold">Wednesday (or earlier)</span>, it will be paid the following Friday of the current week.</p>
              </div>
            </div>
            <p className="text-white/50 text-sm mt-4 italic">Cutoff times may be adjusted and published inside SalesHub.</p>
          </div>
        </section>

        {/* Section 5 - Unit Bonus Program */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-black text-black">5</div>
            <h2 className="text-xl font-bold text-white">Original PayPlan Unit Bonus Program (Monthly)</h2>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <p className="text-white/80 mb-2">
              In addition to commissions, Sales Reps may earn unit bonuses based on the number of funded and delivered deals within the month.
            </p>
            <p className="text-white/60 text-sm mb-4">
              (For unit to count for the month, customer must take delivery of the unit no later than 12am of the last day of the month)
            </p>
            <p className="text-white/80 mb-4">
              Bonuses are paid on the <span className="text-orange-400 font-semibold">SECOND Friday</span> of the following month.
            </p>

            {/* Bonus Tiers Grid */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { units: "5-10", bonus: "$100" },
                { units: "11-15", bonus: "$125" },
                { units: "16-20", bonus: "$150" },
                { units: "21+", bonus: "$175" },
              ].map((tier, i) => (
                <div key={i} className="bg-black/30 rounded-lg p-3 text-center">
                  <p className="text-white font-bold text-lg">{tier.units}</p>
                  <p className="text-white/50 text-xs">units</p>
                  <p className="text-orange-400 font-bold mt-1">+{tier.bonus}</p>
                  <p className="text-white/40 text-xs">per trailer</p>
                </div>
              ))}
            </div>

            {/* Eligibility Rules */}
            <div className="bg-black/20 rounded-lg p-4 mb-4">
              <p className="text-white/60 text-sm font-semibold mb-2 uppercase tracking-wider">Bonus eligibility rules:</p>
              <ul className="space-y-2 text-white/70 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Only deals that meet the <span className="text-orange-400 font-semibold">$1,800.00 minimum gross profit</span> requirement count toward unit bonuses.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Deals must be funded and delivered to count (unless explicitly approved otherwise in writing).</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 6 - Top Performer Bonuses */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-black text-black">6</div>
            <h2 className="text-xl font-bold text-white">Top Performer Bonuses</h2>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <p className="text-white/60 text-sm mb-4">
              These bonuses will take effect together with the Original PayPlan Unit Bonus Program and the combined minimum total of <span className="text-orange-400 font-semibold">35 units</span> delivered for the month by the whole company.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Top Gross Bonus */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <p className="text-orange-400 font-bold text-sm uppercase tracking-wider mb-1">Top Gross Bonus</p>
                <p className="text-3xl font-black text-white">+$500</p>
                <p className="text-white/60 text-sm mt-2">
                  Top Grossing deal for the month will earn the Sales Rep an additional $500 of bonus earnings. That bonus amount will be combined with any other bonuses for that month and get paid on the second Friday of the following month.
                </p>
                <p className="text-orange-400/70 text-xs mt-2 italic">(Sales Reps only qualify for this incentive)</p>
              </div>

              {/* Top Unit Bonus */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-1">Top Unit Bonus</p>
                <p className="text-3xl font-black text-white">+$350</p>
                <p className="text-white/60 text-sm mt-2">
                  The Sales Rep with the most units sold for the month earns an additional $350 of bonus earnings. Minimum required units for the Sales Rep must have for the month to qualify is <span className="text-blue-400 font-semibold">5 Units</span> delivered.
                </p>
                <p className="text-white/50 text-xs mt-2">If there is a tie between 2 or more Reps the decision will be decided by the amount of total gross of units.</p>
                <p className="text-blue-400/70 text-xs mt-1 italic">(Sales Reps only qualify for this incentive)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7 - Payment Method */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-black text-black">7</div>
            <h2 className="text-xl font-bold text-white">Payment Method</h2>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <p className="text-white/70 text-sm mb-4">Payment Methods (Remotive Logistics LLC)</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <p className="text-green-400 font-semibold text-sm mb-1">Preferred</p>
                <p className="text-white font-medium">ACH/Direct Deposit</p>
                <p className="text-white/50 text-sm">from our Wells Fargo business account for clean, trackable records.</p>
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="text-white/50 font-semibold text-sm mb-1">Alternative</p>
                <p className="text-white font-medium">PayPal</p>
                <p className="text-white/50 text-sm">(or other approved payment platform)</p>
              </div>
            </div>
            <p className="text-white/50 text-sm mt-4">
              Reps must provide valid payout details, and all payments will be documented for accounting and 1099 reporting.
            </p>
          </div>
        </section>

        {/* Launch Note */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-8">
          <p className="text-white/70 text-sm">
            <span className="text-orange-400 font-semibold">Updates & Launch Phase Note:</span> This &quot;Launch Phase&quot; pay plan is designed for the startup stage while staffing and operations are being built out. The company may update pay plan terms in the future. Any material changes will be published in writing with a new version number.
          </p>
        </div>

        {/* Accept Section */}
        <div className="text-center">
          <p className="text-white/50 text-sm mb-2">Version: REP-PAYPLAN-LAUNCH-v1 | Effective: January 2026</p>
          <p className="text-white/70 text-sm mb-6">By clicking &quot;Accept & Continue&quot; below, you acknowledge that you have read, understood, and agree to all terms outlined in this pay plan.</p>

          <button
            onClick={handleAccept}
            disabled={accepted}
            className={`px-12 py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all ${
              accepted
                ? "bg-green-500 text-black cursor-not-allowed"
                : "bg-orange-500 text-black hover:bg-orange-400 cursor-pointer"
            }`}
          >
            {accepted ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Accepted
              </span>
            ) : (
              "Accept & Continue"
            )}
          </button>

          {accepted && <p className="text-green-400 mt-4 font-medium">Welcome to the team!</p>}
        </div>

        <footer className="mt-12 pt-6 border-t border-white/10 text-center">
          <p className="text-white/30 text-sm">© 2026 Remotive Logistics LLC</p>
        </footer>
      </div>
    </div>
  );
}
