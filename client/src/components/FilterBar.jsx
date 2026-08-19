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
    <div className="filter-bar">
      <input
        type="text"
        name="search"
        value={filters.search}
        onChange={handleInput}
        placeholder="Search tracking ID, origin, destination, carrier..."
      />

      <select name="status" value={filters.status} onChange={handleInput}>
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
