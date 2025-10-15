"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TrailerSizeTooltipProps {
  model: string;
  children: React.ReactNode;
}

/**
 * Explains trailer model size in simple terms
 * Example: "8.5x12 TA" → explains width, length, and axle type
 */
export function TrailerSizeTooltip({ model, children }: TrailerSizeTooltipProps) {
  const explanation = parseModelSize(model);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help underline decoration-dotted underline-offset-4">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="max-w-sm bg-orange-600 text-white border-orange-700 p-4"
        >
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-base mb-3">Trailer Size Breakdown:</p>

            {explanation.width && (
              <div>
                <span className="font-bold">{explanation.width} ft</span>
                <span className="text-orange-100"> = Width (how wide the trailer is)</span>
              </div>
            )}

            {explanation.length && (
              <div>
                <span className="font-bold">{explanation.length} ft</span>
                <span className="text-orange-100"> = Length (how long the trailer is)</span>
              </div>
            )}

            {explanation.axleType && (
              <div>
                <span className="font-bold">{explanation.axleType}</span>
                <span className="text-orange-100"> = {explanation.axleDescription}</span>
              </div>
            )}

            {explanation.axleWeight && (
              <div className="pt-2 border-t border-orange-500 text-orange-100">
                <span className="text-xs">Weight Capacity: {explanation.axleWeight}</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Parse model size string into human-readable parts
 * Handles formats like: "8.5X12TA4", "6x10SA", "7X14TA", etc.
 */
function parseModelSize(model: string) {
  // Clean up the model string
  const cleaned = model.trim().toUpperCase();

  // Extract dimensions (e.g., "8.5X12" or "6X10")
  const dimensionMatch = cleaned.match(/^(\d+\.?\d*)[X](\d+\.?\d*)/);

  // Extract axle info (e.g., "TA4", "SA", "TA")
  const axleMatch = cleaned.match(/(SA|TA\d?)/);

  const width = dimensionMatch?.[1] || null;
  const length = dimensionMatch?.[2] || null;
  const axleCode = axleMatch?.[1] || null;

  // Decode axle type
  let axleType = null;
  let axleDescription = null;
  let axleWeight = null;

  if (axleCode) {
    if (axleCode === "SA") {
      axleType = "SA (Single Axle)";
      axleDescription = "Has 1 axle - good for lighter loads";
      axleWeight = "3,500 lbs";
    } else if (axleCode === "TA") {
      axleType = "TA (Tandem Axle)";
      axleDescription = "Has 2 axles - handles heavier loads better";
      axleWeight = "7,000 lbs";
    } else if (axleCode === "TA4") {
      axleType = "TA4 (Upgraded Tandem)";
      axleDescription = "Has 2 heavy-duty axles - for maximum weight";
      axleWeight = "9,900 lbs";
    }
  }

  return {
    width,
    length,
    axleType,
    axleDescription,
    axleWeight,
  };
}
