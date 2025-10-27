export default function NewDashPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">New Simple Layout Preview</h1>
        <p className="text-neutral-400 mt-2">
          This is the ChatGPT-style simple layout with clean sidebar and topbar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-6">
          <h3 className="text-lg font-semibold text-white">Simple & Clean</h3>
          <p className="mt-2 text-sm text-neutral-400">
            Minimal sidebar with just essential links
          </p>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-6">
          <h3 className="text-lg font-semibold text-white">Easy Navigation</h3>
          <p className="mt-2 text-sm text-neutral-400">
            Clean topbar with breadcrumbs and user menu
          </p>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-6">
          <h3 className="text-lg font-semibold text-white">Mobile Friendly</h3>
          <p className="mt-2 text-sm text-neutral-400">
            Responsive design that works on all devices
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-6">
        <h2 className="text-xl font-semibold text-orange-400">Compare Layouts</h2>
        <div className="mt-4 space-y-2 text-sm text-neutral-300">
          <p><strong>Current (DashTail):</strong> http://localhost:3000/en/dashboard</p>
          <p><strong>New (Simple):</strong> http://localhost:3000/en (this page)</p>
        </div>
      </div>
    </div>
  );
}
