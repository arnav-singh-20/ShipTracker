import { useState } from 'react';
import StatusBadge from './StatusBadge';

const STATUS_OPTIONS = ['Pending', 'In Transit', 'Customs', 'Delivered'];
const STATUS_DOT_COLOR = {
  Pending: 'bg-slate-400',
  'In Transit': 'bg-blue-500',
  Customs: 'bg-amber-500',
  Delivered: 'bg-green-500',
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// A single timeline row can be in one of two modes: display, or (for admins)
// inline edit. Keeping edit state per-entry (rather than one shared "which
// entry is being edited" id in the parent) keeps this component self-
// contained - the parent just needs to know WHEN something changed so it
// can refetch.
const TimelineEntry = ({ entry, isLast, isAdmin, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    status: entry.status,
    note: entry.note || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(entry._id, form);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this status update? This cannot be undone.')) return;
    await onDelete(entry._id);
  };

  return (
    <li className="relative pl-8">
      {/* Vertical connecting line - omitted after the last entry */}
      {!isLast && (
        <span className="absolute left-[7px] top-3 bottom-0 w-px bg-slate-200" aria-hidden="true" />
      )}
      {/* Dot */}
      <span
        className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-white ${
          STATUS_DOT_COLOR[entry.status] || 'bg-slate-400'
        }`}
        aria-hidden="true"
      />

      <div className="pb-6">
        {editing ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm bg-white"
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
              placeholder="Note (optional)"
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs bg-slate-900 text-white rounded-md px-3 py-1.5 font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-xs text-slate-600 border border-slate-300 rounded-md px-3 py-1.5"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge status={entry.status} />
                <span className="text-xs text-slate-400">{formatDateTime(entry.timestamp)}</span>
              </div>
              {entry.note && <p className="text-sm text-slate-600 mt-1">{entry.note}</p>}
            </div>

            {isAdmin && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
};

// Renders entries oldest-first so the timeline reads top-to-bottom as the
// shipment's actual journey (created -> in transit -> ... -> delivered),
// ending with the current status at the bottom.
const Timeline = ({ history, isAdmin, onUpdate, onDelete }) => {
  const sorted = [...history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <ul>
      {sorted.map((entry, i) => (
        <TimelineEntry
          key={entry._id}
          entry={entry}
          isLast={i === sorted.length - 1}
          isAdmin={isAdmin}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default Timeline;
