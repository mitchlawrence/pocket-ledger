export default function SelectField({
  id,
  label,
  error,
  children,
  ...selectProps
}) {
  const messageId = error ? `${id}-error` : undefined;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-mist-100">
        {label}
      </label>

      <select
        {...selectProps}
        id={id}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={messageId}
        className={`mt-1.5 w-full rounded-md border bg-ink-800 px-3 py-2 text-sm text-mist-100 focus:outline-none focus:ring-1 ${
          error
            ? "border-alert-500 focus:ring-alert-500"
            : "border-ink-600 focus:border-leaf-500 focus:ring-leaf-500"
        }`}
      >
        {children}
      </select>

      {error && (
        <p id={messageId} className="mt-1.5 text-xs text-alert-400">
          {error}
        </p>
      )}
    </div>
  );
}
