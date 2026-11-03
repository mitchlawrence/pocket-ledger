import { useState } from "react";
import { api, ApiError } from "../api/client";
import { useCategories } from "../hooks/useCategories";
import FormField from "../components/FormField";
import SelectField from "../components/SelectField";
import FormError from "../components/FormError";

function CategoryList({ title, items, onDelete }) {
  return (
    <section className="rounded-lg border border-ink-700 bg-ink-900 p-6">
      <h2 className="text-sm font-semibold">{title}</h2>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-mist-300">None yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-ink-700">
          {items.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between gap-4 py-2.5 text-sm"
            >
              <span className="break-words">{category.name}</span>
              <button
                type="button"
                onClick={() => onDelete(category.id)}
                aria-label={`Delete category ${category.name}`}
                className="shrink-0 text-mist-300 hover:text-alert-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-alert-500"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Categories() {
  const { categories, loading, error: loadError, reload } = useCategories();

  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);

    try {
      await api("/categories", { method: "POST", body: { name, type } });
      setName("");
      await reload();
    } catch (err) {
      if (err instanceof ApiError) {
        const fields = err.fields || {};
        setFieldErrors(fields);
        setError(Object.keys(fields).length ? fields.form || "" : err.message);
      } else {
        setError("Cannot reach the server. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setError("");
    try {
      await api(`/categories/${id}`, { method: "DELETE" });
      await reload();
    } catch (err) {
      // For example: "This category still has transactions..."
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Categories</h1>
        <p className="mt-1 text-sm text-mist-300">
          Group your transactions. A category can only be deleted when no
          transactions use it.
        </p>
      </div>

      <section className="rounded-lg border border-ink-700 bg-ink-900 p-6">
        <h2 className="text-sm font-semibold">Add a category</h2>

        <form onSubmit={handleAdd} noValidate className="mt-5 space-y-5">
          <FormError message={error || loadError} />

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <FormField
                id="category-name"
                name="name"
                type="text"
                label="Name"
                maxLength={40}
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={fieldErrors.name}
              />
            </div>

            <SelectField
              id="category-type"
              name="type"
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              error={fieldErrors.type}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </SelectField>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-leaf-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-leaf-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Adding..." : "Add category"}
          </button>
        </form>
      </section>

      {loading ? (
        <p className="text-sm text-mist-300">Loading...</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <CategoryList
            title="Expense categories"
            items={categories.filter((c) => c.type === "expense")}
            onDelete={handleDelete}
          />
          <CategoryList
            title="Income categories"
            items={categories.filter((c) => c.type === "income")}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}
