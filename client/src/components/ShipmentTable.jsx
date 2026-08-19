import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const ShipmentTable = ({ shipments, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return <p className="text-slate-500 text-sm py-8 text-center">Loading shipments...</p>;
  }

  if (shipments.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-slate-300 rounded-xl">
        <p className="text-slate-500">No shipments found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
            <th className="px-4 py-3 font-medium">Tracking ID</th>
            <th className="px-4 py-3 font-medium">Origin</th>
            <th className="px-4 py-3 font-medium">Destination</th>
            <th className="px-4 py-3 font-medium">Carrier</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Est. delivery</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((s) => (
            <tr
              key={s._id}
              onClick={() => navigate(`/shipments/${s._id}`)}
              className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition"
            >
              <td className="px-4 py-3 font-medium text-slate-900">{s.trackingId}</td>
              <td className="px-4 py-3 text-slate-600">{s.origin}</td>
              <td className="px-4 py-3 text-slate-600">{s.destination}</td>
              <td className="px-4 py-3 text-slate-600">{s.carrier}</td>
              <td className="px-4 py-3">
                <StatusBadge status={s.status} />
              </td>
              <td className="px-4 py-3 text-slate-600">{formatDate(s.estimatedDelivery)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShipmentTable;
