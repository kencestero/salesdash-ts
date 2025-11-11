"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Customer {
  firstName?: string;
  lastName?: string;
  zipcode?: string;
  phone?: string;
  email?: string;
}

interface Trailer {
  salePrice?: number;
}

interface OpenInFinanceProps {
  customer: Customer;
  trailer?: Trailer;
  price?: number; // Allow manual price override
}

export default function OpenInFinance({ customer, trailer, price }: OpenInFinanceProps) {
  const router = useRouter();

  function handleOpenFinance() {
    // Build customer name
    const name = [customer.firstName, customer.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    // Get ZIP
    const zip = (customer.zipcode || "").trim();

    // Get price (manual override, trailer price, or 0)
    const finalPrice = price || trailer?.salePrice || 0;

    // Validation
    if (!name) {
      toast({
        title: "Missing Customer Name",
        description: "Customer name is required to open Finance Calculator.",
        variant: "destructive",
      });
      return;
    }

    if (!zip) {
      toast({
        title: "Missing ZIP Code",
        description: "ZIP code is required to calculate accurate payments.",
        variant: "destructive",
      });
      return;
    }

    if (!finalPrice || finalPrice <= 0) {
      toast({
        title: "Missing Price",
        description: "Price is required to generate finance options.",
        variant: "destructive",
      });
      return;
    }

    // Build URL with query params
    const params = new URLSearchParams({
      name,
      zip,
      price: finalPrice.toString(),
    });

    // Add optional phone/email if available
    if (customer.phone) params.set("phone", customer.phone);
    if (customer.email) params.set("email", customer.email);

    // Navigate to finance calculator
    router.push(`/en/finance/compare?${params.toString()}`);
  }

  return (
    <Button onClick={handleOpenFinance} className="gap-2">
      <Calculator className="w-4 h-4" />
      Open in Finance Calculator
    </Button>
  );
}
