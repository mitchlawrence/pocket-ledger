import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-ink-700 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-leaf-400">
            Pocket Ledger
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Welcome, {user.name}
          </h1>
          <p className="mt-1 text-sm text-mist-300">
            Signed in as {user.email}
          </p>
        </header>

        <section className="mt-8 rounded-lg border border-ink-700 bg-ink-900 p-6">
          <p className="text-sm text-mist-300">Ledger will appear here</p>
        </section>
      </div>
    </main>
  );
}
