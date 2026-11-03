import { useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { todayISO } from "../lib/format";
import FormField from "./FormField";
import SelectField from "./SelectField";
import FormError from "./FormError";

export default function TransactionForm({
  categories,
  initial,
  onSaved,
  onCancel,
}) {
  const initialCategory = categories.find((c) => c.id === initial?.categoryId);

  const [type, setType] = useState(initialCategory?.type ?? "expense");
  const [form, setForm] = useState({
    categoryId: initial?.categoryId ?? "",
    amount: initial?.amount ?? "",
    date: initial?.date ?? todayISO(),
    note: initial?.note ?? "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const options = categories.filter((c) => c.type === type);

  function handleChange(e) {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  }

  function changeType(nextType) {
    setType(nextType);
    setForm((current) => ({ ...current, categoryId: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!form.categoryId) {
      setFieldErrors({ categoryId: "Choose a category" });
      return;
    }

    setSubmitting(true);
    const body = {
      categoryId: form.categoryId,
      amount: form.amount.trim(),
      note: form.note,
      date: form.date,
    };

    try {
      if (initial) {
        await api(`/transactions/${initial.id}`, { method: "PUT", body });
      } else {
        await api("/transactions", { method: "POST", body });
      }
      onSaved();
    } catch (err) {
      if (err instanceof ApiError) {
        const fields = err.fields || {};
        setFieldErrors(fields);
        setError(Object.keys(fields).length ? fields.form || "" : err.message);
      } else {
        setError("Cannot reach the server. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <section
      aria-label={initial ? "Edit transaction" : "Add transaction"}
      className="rounded-lg border border-ink-700 bg-ink-900 p-6"
    >
      <h2 className="text-sm font-semibold">
        {initial ? "Edit transaction" : "Add transaction"}
      </h2>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-5">
        <FormError message={error} />

        <div>
          <span className="block text-sm font-medium text-mist-100">Type</span>
          <div
            role="group"
            aria-label="Transaction type"
            className="mt-1.5 inline-flex rounded-md border border-ink-600 p-0.5"
          >
            {["expense", "income"].map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={type === option}
                onClick={() => changeType(option)}
                className={`rounded px-4 py-1.5 text-sm capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 ${
                  type === option
                    ? "bg-leaf-600 text-white"
                    : "text-mist-300 hover:text-mist-100"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <SelectField
              id="tx-category"
              name="categoryId"
              label="Category"
              value={form.categoryId}
              onChange={handleChange}
              error={fieldErrors.categoryId}
            >
              <option value="">Select a category</option>
              {options.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectField>
            {options.length === 0 && (
              <p className="mt-1.5 text-xs text-mist-300">
                No {type} categories yet.{" "}
                <Link
                  to="/categories"
                  className="text-leaf-400 underline underline-offset-4"
                >
                  Add one
                </Link>
              </p>
            )}
          </div>

          <FormField
            id="tx-amount"
            name="amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            label="Amount"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
            error={fieldErrors.amount}
          />

          <FormField
            id="tx-date"
            name="date"
            type="date"
            label="Date"
            value={form.date}
            onChange={handleChange}
            error={fieldErrors.date}
          />

          <FormField
            id="tx-note"
            name="note"
            type="text"
            autoComplete="off"
            maxLength={200}
            label="Note (optional)"
            value={form.note}
            onChange={handleChange}
            error={fieldErrors.note}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-leaf-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-leaf-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : initial
                ? "Save changes"
                : "Add transaction"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-md border border-ink-600 px-4 py-2 text-sm text-mist-100 transition-colors hover:border-mist-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
