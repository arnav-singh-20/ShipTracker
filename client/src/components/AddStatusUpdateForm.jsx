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
    <form onSubmit={handleSubmit} className="add-status-form">
      {error && <p style={{ color: 'var(--red)', fontSize: '12.5px', marginBottom: '8px' }}>{error}</p>}
      <div className="add-status-row">
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
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
        />
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Adding...' : 'Add update'}
        </button>
      </div>
    </form>
  );
};

export default AddStatusUpdateForm;
