"use client";

import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { calculateRTO } from "@/lib/finance/rto-calc";
import { motion, AnimatePresence } from "framer-motion";

export type RTOMatrixProps = {
  price: number;
  taxPct: number;
  downPaymentOptions?: number[];
  baseMarkup?: number;
  monthlyFactor?: number;
  onSelectPayment?: (payment: {
    down: number;
    term: number;
    monthly: number;
    mode: "RTO";
  }) => void;
  onSaveQuote?: () => void;
  onCopySMS?: () => void;
};

const DEFAULT_DOWN_PAYMENTS = [0, 1000, 2500, 5000];
const RTO_TERMS = [24, 36, 48]; // Fixed terms for RTO

export function RTOMatrix({
  price,
  taxPct,
  downPaymentOptions = DEFAULT_DOWN_PAYMENTS,
  baseMarkup = 1400,
  monthlyFactor = 0.035,
  onSelectPayment,
  onSaveQuote,
  onCopySMS,
}: RTOMatrixProps) {
  // Term visibility state (all checked by default)
  const [visibleTerms, setVisibleTerms] = useState<Record<number, boolean>>({
    24: true,
    36: true,
    48: true,
  });

  // Toggle term visibility
  const toggleTerm = (term: number) => {
    setVisibleTerms((prev) => ({ ...prev, [term]: !prev[term] }));
  };

  // Calculate matrix data
  const matrixData = useMemo(() => {
    return RTO_TERMS.filter((term) => visibleTerms[term]).map((term) => ({
      term,
      payments: downPaymentOptions.map((down) => {
        const result = calculateRTO({
          price,
          down,
          taxPct,
          termMonths: term,
          baseMarkupUsd: baseMarkup,
          monthlyFactor,
        });
        return {
          down,
          monthly: result.monthlyTotal,
          monthlyRent: result.monthlyRent,
          monthlyTax: result.monthlyTax,
          rtoPrice: result.rtoPrice,
          dueAtSigning: result.dueAtSigning,
        };
      }),
    }));
  }, [visibleTerms, downPaymentOptions, price, taxPct, baseMarkup, monthlyFactor]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Lease / Rent-To-Own Options
        </h3>
        <span className="text-sm text-muted-foreground">
          Includes $19.99/mo LDW + Fees
        </span>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                Term ↓
              </th>
              {downPaymentOptions.map((down) => (
                <th
                  key={down}
                  className="p-3 text-right text-sm font-medium text-muted-foreground"
                >
                  ${down.toLocaleString()}
                </th>
              ))}
              <th className="w-12 p-3"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {matrixData.map(({ term, payments }) => (
                <motion.tr
                  key={term}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="group border-b border-border/50 transition-colors hover:bg-muted/30"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={visibleTerms[term]}
                        onCheckedChange={() => toggleTerm(term)}
                        className="data-[state=checked]:bg-primary"
                      />
                      <span className="text-sm font-medium">
                        {term} {term === 1 ? "month" : "months"}
                      </span>
                    </div>
                  </td>
                  {payments.map(({ down, monthly, monthlyRent, monthlyTax }) => (
                    <td
                      key={down}
                      className="cursor-pointer p-3 text-right transition-all hover:scale-105"
                      onClick={() =>
                        onSelectPayment?.({
                          down,
                          term,
                          monthly,
                          mode: "RTO",
                        })
                      }
                      title={`Rent: $${monthlyRent.toFixed(2)} + Tax: $${monthlyTax.toFixed(2)}`}
                    >
                      <div className="group-hover:text-primary">
                        <div className="text-2xl font-bold tabular-nums">
                          ${monthly.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {term} months
                        </div>
                      </div>
                    </td>
                  ))}
                  <td className="p-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => {
                        const payment = payments[0];
                        onSelectPayment?.({
                          down: payment.down,
                          term,
                          monthly: payment.monthly,
                          mode: "RTO",
                        });
                      }}
                    >
                      💾
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Info notice */}
      <div className="rounded-lg bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">
          ⚠️ <strong>Note:</strong> RTO terms are fixed at 24, 36, or 48 months.
          Custom terms are not available for Rent-To-Own financing.
        </p>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        💡 Tip: Uncheck a term to remove it from the display. Click any payment
        amount to save as a quote.
      </p>

      {/* Action Buttons */}
      {(onSaveQuote || onCopySMS) && (
        <div className="mt-6 flex gap-3">
          {onSaveQuote && (
            <Button
              onClick={onSaveQuote}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
            >
              ✅ Click to add RTO Scenario to Quote to share
            </Button>
          )}
          {onCopySMS && (
            <Button variant="outline" onClick={onCopySMS} className="flex-1">
              📋 Copy SMS Text
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
