// Customer Name Link Component
// This component makes customer names clickable throughout the CRM

import Link from "next/link";
import { cn } from "@/lib/utils";

interface CustomerNameLinkProps {
  customerId: string;
  firstName: string;
  lastName: string;
  className?: string;
  showIcon?: boolean;
}

export function CustomerNameLink({ 
  customerId, 
  firstName, 
  lastName, 
  className,
  showIcon = false 
}: CustomerNameLinkProps) {
  return (
    <Link 
      href={`/en/crm/customers/${customerId}`}
      className={cn(
        "inline-flex items-center gap-1 font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors cursor-pointer",
        className
      )}
    >
      {showIcon && (
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
          />
        </svg>
      )}
      <span>{firstName} {lastName}</span>
    </Link>
  );
}

// Usage example:
// <CustomerNameLink 
//   customerId={customer.id}
//   firstName={customer.firstName}
//   lastName={customer.lastName}
//   className="text-lg"
// />
