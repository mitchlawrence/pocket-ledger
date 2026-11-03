export default function FormError({ message }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-md border border-alert-500/50 bg-alert-500/10 px-3 py-2 text-sm text-alert-400"
    >
      {message}
    </div>
  );
}
