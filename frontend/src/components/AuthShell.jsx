export default function AuthShell({ title, subtitle, footer, children }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-leaf-400">
          Pocket Ledger
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-mist-300">{subtitle}</p>

        <div className="mt-8 rounded-lg border border-ink-700 bg-ink-950 p-6">
          {children}
        </div>

        <p className="mt-6 text-sm text-mist-300">{footer}</p>
      </div>
    </main>
  );
}
