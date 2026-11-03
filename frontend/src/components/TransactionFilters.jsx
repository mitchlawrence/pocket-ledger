import FormField from "./FormField";
import SelectField from "./SelectField";

export default function TransactionFilters({
  filters,
  categories,
  onChange,
  onClear,
  canClear,
}) {
  const expense = categories.filter((c) => c.type === "expense");
  const income = categories.filter((c) => c.type === "income");

  const option = (c) => (
    <option key={c.id} value={c.id}>
      {c.name}
    </option>
  );

  return (
    <section
      aria-label="Filters"
      className="rounded-lg border border-ink-700 bg-ink-900 p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <FormField
            id="filter-search"
            type="search"
            label="Search"
            placeholder="Note or category"
            maxLength={100}
            autoComplete="off"
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
          />
        </div>

        <SelectField
          id="filter-type"
          label="Type"
          value={filters.type}
          onChange={(e) => onChange("type", e.target.value)}
        >
          <option value="">All</option>
          <option value="expense">Expenses</option>
          <option value="income">Income</option>
        </SelectField>

        <SelectField
          id="filter-category"
          label="Category"
          value={filters.categoryId}
          onChange={(e) => onChange("categoryId", e.target.value)}
        >
          <option value="">All</option>
          {filters.type === "" ? (
            <>
              <optgroup label="Expenses">{expense.map(option)}</optgroup>
              <optgroup label="Income">{income.map(option)}</optgroup>
            </>
          ) : filters.type === "expense" ? (
            expense.map(option)
          ) : (
            income.map(option)
          )}
        </SelectField>

        <FormField
          id="filter-from"
          type="date"
          label="From"
          value={filters.from}
          onChange={(e) => onChange("from", e.target.value)}
        />

        <FormField
          id="filter-to"
          type="date"
          label="To"
          value={filters.to}
          onChange={(e) => onChange("to", e.target.value)}
        />
      </div>

      {canClear && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-leaf-400 underline underline-offset-4 hover:text-leaf-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
