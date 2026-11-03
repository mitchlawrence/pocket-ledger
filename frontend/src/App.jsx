import { useEffect, useState } from "react";

export default function App() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status === "ok" ? "connected" : "error"))
      .catch(() => setStatus("error"));
  }, []);

  const connected = status === "connected";

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-ink-700 bg-ink-900 p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Pocket Ledger</h1>
        <p className="mt-2 text-sm text-mist-300">
          Personal income and expense tracking.
        </p>

        <div className="mt-6 flex items-center gap-3 rounded-md border border-ink-700 bg-ink-800 px-4 py-3">
          <span className="text-sm text-mist-300">
            Server:{" "}
            <span className="text-mist-100">
              {status === "checking"
                ? "checking..."
                : connected
                  ? "connected"
                  : "unreachable"}
            </span>
          </span>
        </div>
      </div>
    </main>
  );
}
