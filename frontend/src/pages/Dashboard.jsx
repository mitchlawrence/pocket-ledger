import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatMoney, netAmount } from "../lib/format";
import FormError from "../components/FormError";

function Stat({ label, value, detail, featured = false }) {
  return (
    <div className={`rounded-lg border px-5 py-4 shadow-sm ${featured ? "border-leaf-500 bg-leaf-600 text-white" : "border-ink-700 bg-white"}`}>
      <p className={`text-xs uppercase tracking-wide ${featured ? "text-white/80" : "text-mist-300"}`}>{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className={`mt-1 text-xs ${featured ? "text-white/70" : "text-mist-500"}`}>{detail}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/transactions/summary")
      .then((result) => {
        setData(result);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const income = data?.totals?.income ?? 0;
  const expense = data?.totals?.expense ?? 0;
  const expenseTotal = Number(expense);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Welcome back, {user.name}
          </h1>
          <p className="mt-1 text-sm text-mist-300">
            Here is how your ledger is doing.
          </p>
        </div>
        <Link
          to="/transactions"
          className="shrink-0 rounded-md bg-leaf-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-leaf-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
        >
          View transactions
        </Link>
      </div>

      <FormError message={error} />

      {loading ? (
        <p className="text-sm text-mist-300">Loading your ledger...</p>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Balance" value={formatMoney(netAmount(income, expense))} detail="Income minus expenses" featured />
            <Stat label="Income" value={formatMoney(income)} detail="All recorded income" />
            <Stat label="Expenses" value={formatMoney(expense)} detail={`${data.total} transactions total`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg border border-ink-700 bg-white p-5 shadow-sm">
              <h2 className="font-semibold">Expenses by category</h2>
              {data.expenseCategories.length === 0 ? (
                <p className="mt-4 text-sm text-mist-300">No expenses recorded yet.</p>
              ) : (
                <div className="mt-5 space-y-4">
                  {data.expenseCategories.map((category) => {
                    const amount = Number(category.amount);
                    const share = expenseTotal > 0 ? (amount / expenseTotal) * 100 : 0;
                    return (
                      <div key={category.id}>
                        <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
                          <span className="break-words">{category.name}</span>
                          <span className="shrink-0 tabular-nums text-mist-300">
                            {formatMoney(category.amount)}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-ink-700">
                          <div
                            className="h-full rounded-full bg-leaf-500"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-lg border border-ink-700 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-semibold">Recent activity</h2>
                <Link to="/transactions" className="text-sm text-leaf-400 hover:text-leaf-400">
                  View all
                </Link>
              </div>
              {data.recent.length === 0 ? (
                <p className="mt-4 text-sm text-mist-300">
                  Your latest transactions will appear here.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-ink-700">
                  {data.recent.map((transaction) => (
                    <li key={transaction.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{transaction.categoryName}</p>
                        <p className="mt-0.5 truncate text-xs text-mist-500">
                          {formatDate(transaction.date)}
                          {transaction.note ? ` · ${transaction.note}` : ""}
                        </p>
                      </div>
                      <span className={`shrink-0 tabular-nums ${transaction.type === "income" ? "text-leaf-400" : "text-mist-100"}`}>
                        {transaction.type === "income" ? "+" : "-"}{formatMoney(transaction.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
