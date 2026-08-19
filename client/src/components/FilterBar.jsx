const STATUS_OPTIONS = ['Pending', 'In Transit', 'Customs', 'Delivered'];

// Controlled by the parent (Dashboard) - this component just renders the
// inputs and calls back up on change. Keeping filter STATE in the parent
// (rather than here) means Dashboard can trigger the actual API refetch
// whenever a filter changes, without prop-drilling a fetch function down.
const FilterBar = ({ filters, onChange }) => {
  const handleInput = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <input
        type="text"
        name="search"
        value={filters.search}
        onChange={handleInput}
        placeholder="Search tracking ID, origin, destination, carrier..."
        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
      />

      <select
        name="status"
        value={filters.status}
        onChange={handleInput}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterBar;
