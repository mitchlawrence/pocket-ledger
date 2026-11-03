export default function SubmitButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-md bg-leaf-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-leaf-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
