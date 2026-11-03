const buttonClass =
  "rounded-md border border-ink-600 px-3 py-1.5 text-sm text-mist-100 transition-colors hover:border-leaf-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink-600";

export default function Pagination({ page, totalPages, total, onPageChange }) {
  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex items-center justify-between gap-4 text-sm"
    >
      <p className="text-mist-300">
        Page {page} of {totalPages}, {total}{" "}
        {total === 1 ? "transaction" : "transactions"}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          className={buttonClass}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className={buttonClass}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
