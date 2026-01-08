"use client";

import { useState, useMemo, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  // Callbacks to expose internal state to parent
  onDownPaymentsChange?: (downPayments: number[]) => void;
  onVisibleTermsChange?: (visibleTerms: number[]) => void;
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
  onDownPaymentsChange,
  onVisibleTermsChange,
}: RTOMatrixProps) {
  // Editable down payments (start with defaults)
  const [downPayments, setDownPayments] = useState<number[]>(downPaymentOptions);
  const [editingDownIndex, setEditingDownIndex] = useState<number | null>(null);
  const [editDownValue, setEditDownValue] = useState("");

  // Maximum down payment (70% of price)
  const maxDownPayment = Math.floor(price * 0.70);

  // Term visibility state (all checked by default)
  const [visibleTerms, setVisibleTerms] = useState<Record<number, boolean>>({
    24: true,
    36: true,
    48: true,
  });

  // Notify parent when down payments change
  useEffect(() => {
    onDownPaymentsChange?.(downPayments);
  }, [downPayments, onDownPaymentsChange]);

  // Notify parent when visible terms change
  useEffect(() => {
    const activeTerms = RTO_TERMS.filter(term => visibleTerms[term]);
    onVisibleTermsChange?.(activeTerms);
  }, [visibleTerms, onVisibleTermsChange]);

  // Toggle term visibility
  const toggleTerm = (term: number) => {
    setVisibleTerms((prev) => ({ ...prev, [term]: !prev[term] }));
  };

  // Handle down payment edit - clear field on click for fresh input
  const startEditingDown = (index: number, value: number) => {
    setEditingDownIndex(index);
    setEditDownValue("");  // Clear field so user can type fresh
  };

  const saveEditingDown = (index: number) => {
    const newValue = parseInt(editDownValue);
    if (isNaN(newValue) || newValue < 0) {
      setEditingDownIndex(null);
      return;
    }

    // Check 70% maximum
    if (newValue > maxDownPayment) {
      alert(`Maximum down payment is $${maxDownPayment.toLocaleString()} (70% of unit price)`);
      setEditingDownIndex(null);
      return;
    }

    setDownPayments((prev) => {
      const updated = [...prev];
      updated[index] = newValue;
      return updated.sort((a, b) => a - b); // Keep sorted
    });
    setEditingDownIndex(null);
  };

  const cancelEditingDown = () => {
    setEditingDownIndex(null);
    setEditDownValue("");
  };

  // Calculate matrix data
  const matrixData = useMemo(() => {
    return RTO_TERMS.filter((term) => visibleTerms[term]).map((term) => ({
      term,
      payments: downPayments.map((down) => {
        const result = calculateRTO({
          price,
          down,
          taxPct,
          termMonths: term,
          // No legacy parameters - use new RTO factor formula
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
  }, [visibleTerms, downPayments, price, taxPct]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Lease / Rent-To-Own Options
        </h3>
        <span className="text-sm text-foreground/80">
          Includes $19.99/mo LDW + Fees
        </span>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-3 text-left text-sm font-medium text-foreground/70">
                Term ↓
              </th>
              {downPayments.map((down, index) => (
                <th
                  key={`down-${index}-${down}`}
                  className="p-3 text-right text-sm font-medium text-foreground/70"
                >
                  {editingDownIndex === index ? (
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xs">$</span>
                      <Input
                        type="number"
                        value={editDownValue}
                        onChange={(e) => setEditDownValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditingDown(index);
                          if (e.key === "Escape") cancelEditingDown();
                        }}
                        onBlur={() => saveEditingDown(index)}
                        className="h-7 w-24 text-right text-sm"
                        autoFocus
                        aria-label={`Edit down payment ${index + 1}`}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditingDown(index, down)}
                      className="hover:text-primary transition-colors cursor-pointer"
                      aria-label={`Edit down payment: $${down.toLocaleString()} (max 70% of price)`}
                    >
                      ${down.toLocaleString()} ✏️
                    </button>
                  )}
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
                        <div className="text-xs text-foreground/70">
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
                      aria-label={`Save ${term} month RTO option`}
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
        <p className="text-xs text-foreground/80">
          ⚠️ <strong>Note:</strong> RTO terms are fixed at 24, 36, or 48 months.
          Custom terms are not available for Rent-To-Own financing.
        </p>
      </div>

      {/* Helper text */}
      <p className="text-xs text-foreground/80">
        💡 Tip: Click down payment headers ✏️ to edit (max ${maxDownPayment.toLocaleString()} = 70% of price).
        Uncheck terms to hide. Click any payment to save as quote.
      </p>

      {/* SMS Copy Button */}
      {onCopySMS && (
        <div className="mt-6">
          <Button variant="outline" onClick={onCopySMS} className="w-full sm:w-auto">
            📋 Copy RTO Options as SMS Text
          </Button>
        </div>
      )}
    </div>
  );
}
