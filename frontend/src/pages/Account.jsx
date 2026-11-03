import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import FormField from "../components/FormField";
import FormError from "../components/FormError";

export default function Account() {
  const { user, deleteAccount } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function cancel() {
    setConfirming(false);
    setPassword("");
    setError("");
    setFieldError("");
  }

  async function handleDelete(e) {
    e.preventDefault();
    setError("");
    setFieldError("");
    setSubmitting(true);

    try {
      await deleteAccount(password);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields?.password) setFieldError(err.fields.password);
        else setError(err.message);
      } else {
        setError("Cannot reach the server. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Account</h1>
      <p className="mt-1 text-sm text-mist-300">
        Your details and account controls.
      </p>

      <section className="mt-8 rounded-lg border border-ink-700 bg-ink-900 p-6">
        <h2 className="text-sm font-semibold">Profile</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-mist-300">Name</dt>
            <dd className="break-all text-right">{user.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-mist-300">Email</dt>
            <dd className="break-all text-right">{user.email}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-lg border border-alert-500/40 bg-ink-900 p-6">
        <h2 className="text-sm font-semibold text-alert-400">Delete account</h2>
        <p className="mt-2 text-sm text-mist-300">
          This permanently removes your account and everything in it:
          transactions, categories, budgets, and recurring entries. This cannot
          be undone.
        </p>

        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-5 rounded-md border border-alert-500/60 px-4 py-2 text-sm text-alert-400 transition-colors hover:bg-alert-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-alert-500"
          >
            Delete my account
          </button>
        ) : (
          <form onSubmit={handleDelete} noValidate className="mt-5 space-y-4">
            <FormError message={error} />

            <FormField
              id="delete-password"
              name="password"
              type="password"
              label="Enter your password to confirm"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldError}
            />

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-alert-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-alert-500/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-alert-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Deleting..." : "Permanently delete account"}
              </button>
              <button
                type="button"
                onClick={cancel}
                disabled={submitting}
                className="rounded-md border border-ink-600 px-4 py-2 text-sm text-mist-100 transition-colors hover:border-mist-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
