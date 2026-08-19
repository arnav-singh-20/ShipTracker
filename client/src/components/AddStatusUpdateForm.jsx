import { useState } from 'react';

const STATUS_OPTIONS = ['Pending', 'In Transit', 'Customs', 'Delivered'];

const AddStatusUpdateForm = ({ onAdd }) => {
  const [form, setForm] = useState({ status: 'In Transit', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onAdd(form);
      setForm({ status: 'In Transit', note: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add status update.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-4 mt-2 space-y-2">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm bg-white"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          placeholder="Note (optional) — e.g. 'Cleared customs in Rotterdam'"
          className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="text-sm bg-slate-900 text-white rounded-md px-4 py-1.5 font-medium disabled:opacity-50 whitespace-nowrap"
        >
          {submitting ? 'Adding...' : 'Add update'}
        </button>
      </div>
    </form>
  );
};

export default AddStatusUpdateForm;
