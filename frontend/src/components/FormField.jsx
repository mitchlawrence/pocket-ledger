export default function FormField({ id, label, error, hint, ...inputProps }) {
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-mist-100">
        {label}
      </label>

      <input
        {...inputProps}
        id={id}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={messageId}
        className={`mt-1.5 w-full rounded-md border bg-ink-800 px-3 py-2 text-sm text-mist-100 placeholder:text-mist-500 focus:outline-none focus:ring-1 ${
          error
            ? "border-alert-500 focus:ring-alert-500"
            : "border-ink-600 focus:border-leaf-500 focus:ring-leaf-500"
        }`}
      />

      {error ? (
        <p id={messageId} className="mt-1.5 text-xs text-alert-400">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="mt-1.5 text-xs text-mist-300">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
