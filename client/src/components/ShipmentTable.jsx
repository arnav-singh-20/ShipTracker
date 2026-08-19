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
    return <p className="loading-state">Loading shipments...</p>;
  }

  if (shipments.length === 0) {
    return (
      <div className="empty-state">
        <p>No shipments found.</p>
      </div>
    );
  }

  return (
    <div className="panel ship-table">
      <div className="ship-row head">
        <div>Tracking ID</div>
        <div>Origin</div>
        <div>Destination</div>
        <div>Carrier</div>
        <div>Status</div>
        <div>Est. delivery</div>
      </div>
      {shipments.map((s) => (
        <div
          key={s._id}
          onClick={() => navigate(`/shipments/${s._id}`)}
          className="ship-row body"
        >
          <div className="cell-primary">{s.trackingId}</div>
          <div className="cell-muted">{s.origin}</div>
          <div className="cell-muted">{s.destination}</div>
          <div className="cell-muted">{s.carrier}</div>
          <div><StatusBadge status={s.status} /></div>
          <div className="cell-muted">{formatDate(s.estimatedDelivery)}</div>
        </div>
      ))}
    </div>
  );
};

export default ShipmentTable;
