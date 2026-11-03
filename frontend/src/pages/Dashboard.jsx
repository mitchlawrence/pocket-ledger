import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">
        Welcome, {user.name}
      </h1>
      <p className="mt-1 text-sm text-mist-300">Signed in as {user.email}</p>

      <section className="mt-8 rounded-lg border border-ink-700 bg-ink-900 p-6">
        <p className="text-sm text-mist-300">Ledger will appear here.</p>
      </section>
    </div>
  );
}
