"use client";

import { useMemo } from "react";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { calculateCash } from "@/lib/finance/cash-calc";

export type CashSummaryProps = {
  price: number;
  taxPct: number;
  fees: number;
  addedOptions?: number;
  onSaveQuote?: (quote: {
    totalCash: number;
    mode: "CASH";
  }) => void;
  onShare?: () => void;
  onGeneratePDF?: () => void;
};

export function CashSummary({
  price,
  taxPct,
  fees,
  addedOptions = 0,
  onSaveQuote,
  onShare,
  onGeneratePDF,
}: CashSummaryProps) {
  const cashData = useMemo(() => {
    return calculateCash({
      price,
      taxPct,
      fees,
      addedOptions,
    });
  }, [price, taxPct, fees, addedOptions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-success" />
        <h3 className="text-lg font-semibold text-foreground">
          Cash Purchase Option
        </h3>
      </div>

      {/* Cash breakdown card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="space-y-4">
          {/* Sale Price */}
          <div className="flex justify-between text-base">
            <span className="text-muted-foreground">Sale Price:</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(cashData.basePrice)}
            </span>
          </div>

          {/* Added Options */}
          {addedOptions > 0 && (
            <div className="flex justify-between text-base">
              <span className="text-muted-foreground">Added Options:</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(cashData.addedOptions)}
              </span>
            </div>
          )}

          {/* Gov / Other Fees */}
          <div className="flex justify-between text-base">
            <span className="text-muted-foreground">Gov / Other Fees:</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(cashData.fees)}
            </span>
          </div>

          {/* Sales Tax */}
          <div className="flex justify-between text-base">
            <span className="text-muted-foreground">
              Sales Tax ({taxPct.toFixed(2)}%):
            </span>
            <span className="font-medium tabular-nums">
              {formatCurrency(cashData.taxes)}
            </span>
          </div>

          <Separator className="my-4" />

          {/* Total Cash Due */}
          <div className="flex justify-between text-xl font-bold">
            <span className="text-foreground">Total Cash Due:</span>
            <span className="text-success tabular-nums">
              {formatCurrency(cashData.totalCash)}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => onSaveQuote?.({ totalCash: cashData.totalCash, mode: "CASH" })}
            className="flex-1 bg-success hover:bg-success/90"
          >
            ✅ Click to add Cash scenario to Quote to share
          </Button>
          {onShare && (
            <Button variant="outline" onClick={onShare} className="flex-1">
              📋 Copy SMS Text
            </Button>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-lg bg-success/10 p-3 border border-success/20">
        <p className="text-xs text-success-foreground">
          ✨ <strong>Cash Payment Advantage:</strong> No monthly payments, no
          interest charges. Pay once and own it immediately!
        </p>
      </div>
    </div>
  );
}
