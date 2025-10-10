"use client";

import { useState, useMemo } from "react";
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { calculateFinance } from "@/lib/finance/finance-calc";
import { motion, AnimatePresence } from "framer-motion";

export type FinanceMatrixProps = {
  price: number;
  taxPct: number;
  fees: number;
  apr: number;
  downPaymentOptions?: number[];
  onSelectPayment?: (payment: {
    down: number;
    term: number;
    monthly: number;
    mode: "FINANCE";
  }) => void;
};

const DEFAULT_DOWN_PAYMENTS = [0, 1000, 2500, 5000];
const DEFAULT_TERMS = [24, 36, 48, 60];

export function FinanceMatrix({
  price,
  taxPct,
  fees,
  apr,
  downPaymentOptions = DEFAULT_DOWN_PAYMENTS,
  onSelectPayment,
}: FinanceMatrixProps) {
  // Term visibility state (all checked by default)
  const [visibleTerms, setVisibleTerms] = useState<Record<number, boolean>>({
    24: true,
    36: true,
    48: true,
    60: true,
  });

  // Custom term state
  const [showCustomTerm, setShowCustomTerm] = useState(false);
  const [customTermInput, setCustomTermInput] = useState("");
  const [customTerms, setCustomTerms] = useState<number[]>([]);

  // All terms (default + custom)
  const allTerms = useMemo(() => {
    const terms = [...DEFAULT_TERMS, ...customTerms].sort((a, b) => a - b);
    return Array.from(new Set(terms)); // Remove duplicates
  }, [customTerms]);

  // Toggle term visibility
  const toggleTerm = (term: number) => {
    setVisibleTerms((prev) => ({ ...prev, [term]: !prev[term] }));
  };

  // Add custom term
  const addCustomTerm = () => {
    const term = parseInt(customTermInput);
    if (term >= 1 && term <= 140 && !allTerms.includes(term)) {
      setCustomTerms((prev) => [...prev, term]);
      setVisibleTerms((prev) => ({ ...prev, [term]: true }));
      setCustomTermInput("");
      setShowCustomTerm(false);
    }
  };

  // Remove custom term
  const removeCustomTerm = (term: number) => {
    setCustomTerms((prev) => prev.filter((t) => t !== term));
    setVisibleTerms((prev) => {
      const newTerms = { ...prev };
      delete newTerms[term];
      return newTerms;
    });
  };

  // Calculate matrix data
  const matrixData = useMemo(() => {
    return allTerms
      .filter((term) => visibleTerms[term])
      .map((term) => ({
        term,
        payments: downPaymentOptions.map((down) => {
          const result = calculateFinance({
            price,
            down,
            taxPct,
            fees,
            aprPercent: apr,
            termMonths: term,
          });
          return {
            down,
            monthly: result.monthlyPayment,
            principal: result.principal,
            totalInterest: result.totalInterest,
          };
        }),
      }));
  }, [allTerms, visibleTerms, downPaymentOptions, price, taxPct, fees, apr]);

  const isCustomTerm = (term: number) => customTerms.includes(term);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Finance Options</h3>
        <span className="text-sm text-muted-foreground">APR: {apr.toFixed(2)}%</span>
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
                      {isCustomTerm(term) && (
                        <button
                          onClick={() => removeCustomTerm(term)}
                          className="ml-1 rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Remove custom term"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </td>
                  {payments.map(({ down, monthly }) => (
                    <td
                      key={down}
                      className="cursor-pointer p-3 text-right transition-all hover:scale-105"
                      onClick={() =>
                        onSelectPayment?.({
                          down,
                          term,
                          monthly,
                          mode: "FINANCE",
                        })
                      }
                    >
                      <div className="group-hover:text-primary">
                        <div className="text-2xl font-bold tabular-nums">
                          ${monthly.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          APR {apr.toFixed(2)}%
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
                          mode: "FINANCE",
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

      {/* Custom Term Input */}
      <Collapsible open={showCustomTerm} onOpenChange={setShowCustomTerm}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            Add Custom Term (1-140 months)
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              max="140"
              placeholder="Enter months (e.g., 72)"
              value={customTermInput}
              onChange={(e) => setCustomTermInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addCustomTerm();
              }}
              className="max-w-xs"
            />
            <Button onClick={addCustomTerm} disabled={!customTermInput}>
              Add
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        💡 Tip: Uncheck a term to remove it from the display and all quote generators.
        Click any payment amount to save as a quote.
      </p>
    </div>
  );
}
