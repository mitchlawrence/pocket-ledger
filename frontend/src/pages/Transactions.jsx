import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { useCategories } from "../hooks/useCategories";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { formatDate, formatMoney, netAmount } from "../lib/format";
import TransactionForm from "../components/TransactionForm";
import TransactionFilters from "../components/TransactionFilters";
import Pagination from "../components/Pagination";
import FormError from "../components/FormError";

const PAGE_SIZE = 10;
const EMPTY_FILTERS = {
  search: "",
  type: "",
  categoryId: "",
  from: "",
  to: "",
  page: 1,
};

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-mist-300">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export default function Transactions() {
  const { categories } = useCategories();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  const debouncedSearch = useDebouncedValue(filters.search);
  const requestNumber = useRef(0);

  useEffect(() => {
    const myNumber = ++requestNumber.current;

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.type) params.set("type", filters.type);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    params.set("page", String(filters.page));
    params.set("pageSize", String(PAGE_SIZE));

    setLoading(true);

    api(`/transactions?${params}`)
      .then((result) => {
        if (myNumber !== requestNumber.current) return;

        if (result.items.length === 0 && result.page > 1) {
          setFilters((f) => ({ ...f, page: result.totalPages }));
          return;
        }
        setData(result);
        setError("");
      })
      .catch((err) => {
        if (myNumber !== requestNumber.current) return;
        setError(err.fields?.from || err.message);
      })
      .finally(() => {
        if (myNumber === requestNumber.current) setLoading(false);
      });
  }, [
    debouncedSearch,
    filters.type,
    filters.categoryId,
    filters.from,
    filters.to,
    filters.page,
    reloadKey,
  ]);

  function handleFilterChange(name, value) {
    setFilters((current) => {
      const next = { ...current, [name]: value, page: 1 };
      if (name === "type") next.categoryId = "";
      return next;
    });
  }

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(transaction) {
    setEditing(transaction);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function handleSaved() {
    closeForm();
    setFilters((f) => ({ ...f, page: 1 }));
    setReloadKey((k) => k + 1);
  }

  async function handleDelete(id) {
    try {
      await api(`/transactions/${id}`, { method: "DELETE" });
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.message);
    }
    setConfirmingId(null);
  }

  const items = data?.items ?? [];
  const hasFilters = Boolean(
    filters.search ||
    filters.type ||
    filters.categoryId ||
    filters.from ||
    filters.to,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-mist-300">
            Record your income and spending.
          </p>
        </div>
        {!formOpen && (
          <button
            type="button"
            onClick={openNew}
            className="shrink-0 rounded-md bg-leaf-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-leaf-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
          >
            Add transaction
          </button>
        )}
      </div>

      {formOpen && (
        <TransactionForm
          key={editing?.id ?? "new"}
          categories={categories}
          initial={editing}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      )}

      {data && (
        <div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Income" value={formatMoney(data.totals.income)} />
            <Stat label="Expenses" value={formatMoney(data.totals.expense)} />
            <Stat
              label="Net"
              value={formatMoney(
                netAmount(data.totals.income, data.totals.expense),
              )}
            />
          </div>
          <p className="mt-2 text-xs text-mist-300">
            Totals cover everything that matches your filters, not just this
            page.
          </p>
        </div>
      )}

      <TransactionFilters
        filters={filters}
        categories={categories}
        onChange={handleFilterChange}
        onClear={() => setFilters(EMPTY_FILTERS)}
        canClear={hasFilters}
      />

      <FormError message={error} />

      {!data && loading ? (
        <p className="text-sm text-mist-300">Loading...</p>
      ) : data && items.length === 0 ? (
        <div className="rounded-lg border border-ink-700 bg-ink-900 p-6">
          <p className="text-sm text-mist-300">
            {hasFilters
              ? "No transactions match your filters."
              : "No transactions yet. Use the Add transaction button to record your first one."}
          </p>
        </div>
      ) : (
        data && (
          <>
            <div
              className={`overflow-x-auto rounded-lg border border-ink-700 bg-ink-900 transition-opacity ${
                loading ? "opacity-60" : ""
              }`}
            >
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-ink-700 text-xs uppercase tracking-wide text-mist-300">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Category
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Note
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right font-medium"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right font-medium"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-ink-700 last:border-0"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-mist-300">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-4 py-3">{tx.categoryName}</td>
                      <td className="max-w-xs break-words px-4 py-3 text-mist-300">
                        {tx.note || "-"}
                      </td>
                      <td
                        className={`whitespace-nowrap px-4 py-3 text-right tabular-nums ${
                          tx.type === "income"
                            ? "text-leaf-400"
                            : "text-mist-100"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatMoney(tx.amount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {confirmingId === tx.id ? (
                          <span className="inline-flex items-center gap-3">
                            <span className="text-mist-300">Delete?</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(tx.id)}
                              className="text-alert-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-alert-500"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingId(null)}
                              className="text-mist-300 hover:text-mist-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400"
                            >
                              No
                            </button>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() => openEdit(tx)}
                              aria-label={`Edit ${tx.categoryName} transaction from ${formatDate(tx.date)}`}
                              className="text-mist-300 hover:text-leaf-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingId(tx.id)}
                              aria-label={`Delete ${tx.categoryName} transaction from ${formatDate(tx.date)}`}
                              className="text-mist-300 hover:text-alert-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-alert-500"
                            >
                              Delete
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
          </>
        )
      )}
    </div>
  );
}
