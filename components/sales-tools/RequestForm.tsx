"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useToast } from "@/components/ui/use-toast";
import { submitRequest } from "@/app/(dash)/sales-tools/request/actions";

type ActionState = {
  ok: boolean;
  message?: string;
  reset?: boolean;
};

const initialState: ActionState = { ok: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white ring-1 ring-orange-500/40 hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 animate-spin"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
            <path
              d="M22 12a10 10 0 0 1-10 10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
          </svg>
          Sending…
        </span>
      ) : (
        "Send Request"
      )}
    </button>
  );
}

export default function RequestForm({ userProfile }: { userProfile: any }) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const [state, formAction] = useActionState<ActionState, FormData>(
    // @ts-expect-error server action type is injected by Next.js
    submitRequest,
    initialState
  );

  useEffect(() => {
    if (!state) return;

    if (state.ok) {
      toast({
        title: "Request sent",
        description: state.message || "We emailed your request successfully.",
      });
      // Optional: reset form if server asked for it
      if (state.reset !== false) formRef.current?.reset();
    } else if (state.message) {
      toast({
        title: "Couldn't send request",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  // Auto-fill values from logged-in user
  const defaultFullName = userProfile ? `${userProfile.profile?.firstName || ""} ${userProfile.profile?.lastName || ""}`.trim() : "";
  const defaultEmail = userProfile?.email || "";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4"
    >
      {/* Hidden fields for rep tracking */}
      <input type="hidden" name="submittedByUserId" value={userProfile?.id || ""} />
      <input type="hidden" name="repCode" value={userProfile?.profile?.repCode || ""} />
      <input type="hidden" name="managerId" value={userProfile?.profile?.managerId || ""} />

      <div className="grid gap-2">
        <label htmlFor="fullName" className="text-sm text-neutral-300">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          required
          defaultValue={defaultFullName}
          placeholder="Jane Doe"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm text-neutral-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          placeholder="jane@example.com"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="manufacturer" className="text-sm text-neutral-300">
          Manufacturer
        </label>
        <select
          id="manufacturer"
          name="manufacturer"
          required
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-500"
        >
          <option value="">Select Manufacturer</option>
          <option value="diamond">Diamond Cargo</option>
          <option value="quality">Quality Cargo</option>
          <option value="cargo-craft">Cargo Craft</option>
          <option value="panther">Panther Trailers</option>
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor="purpose" className="text-sm text-neutral-300">
          Purpose
        </label>
        <select
          id="purpose"
          name="purpose"
          required
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-500"
        >
          <option value="">Select Purpose</option>
          <option value="quote">Get Quote</option>
          <option value="availability">Check Availability</option>
          <option value="pictures">Request Pictures</option>
          <option value="specs">Request Specs</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor="message" className="text-sm text-neutral-300">
          Request details
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Trailer size, color, options, budget…"
          className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-neutral-500">
          We'll email a copy and log it for follow-up.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
