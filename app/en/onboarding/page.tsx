export default function Onboarding() {
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-xl space-y-6">
        <h1 className="text-2xl font-semibold">Welcome to SalesDash</h1>
        <p className="text-muted-foreground">
          First time here? Enter your company code to unlock your account.
        </p>

        <div className="flex gap-3">
          <a
            href="/en/auth/join"
            className="inline-flex items-center justify-center rounded-md bg-[#E96114] px-4 py-2 text-white hover:opacity-90"
          >
            Enter Company Code
          </a>

          <a
            href="/en/dashboard"
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 hover:bg-muted/40"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
