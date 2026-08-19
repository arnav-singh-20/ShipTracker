import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getShipments, getShipmentSummary } from '../api/shipmentApi';
import SummaryCards from '../components/SummaryCards';
import FilterBar from '../components/FilterBar';
import ShipmentTable from '../components/ShipmentTable';
import '../styles/app-theme.css';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [shipments, setShipments] = useState([]);
  const [summary, setSummary] = useState({ total: 0, inTransit: 0, delivered: 0, delayed: 0 });
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Summary only needs to load once on mount - it's not affected by the
  // list filters, since the cards show overall counts regardless of what's
  // currently being searched/filtered in the table below.
  useEffect(() => {
    getShipmentSummary()
      .then(setSummary)
      .catch(() => {
        /* non-critical - if summary fails to load, cards just stay at 0 */
      });
  }, []);

  const fetchShipments = useCallback(() => {
    setLoading(true);
    setError('');
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;

    getShipments(params)
      .then(setShipments)
      .catch(() => setError('Failed to load shipments. Please try refreshing.'))
      .finally(() => setLoading(false));
  }, [filters]);

  // Debounce: wait 300ms after the user stops typing/changing a filter
  // before hitting the API, so every keystroke in the search box doesn't
  // fire its own request.
  useEffect(() => {
    const timeout = setTimeout(fetchShipments, 300);
    return () => clearTimeout(timeout);
  }, [fetchShipments]);

  return (
    <div className="app-shell">
      <div className="app-wrap">
        <div className="app-header">
          <div>
            <h1 className="app-title">ShipTrack Dashboard</h1>
            <p className="app-sub">
              {user?.name} · {user?.role === 'admin' ? 'Admin (all shipments)' : 'Your shipments'}
            </p>
          </div>
          <div className="app-actions">
            <Link to="/shipments/new" className="btn-primary">
              + New shipment
            </Link>
            <button onClick={logout} className="btn-secondary">
              Log out
            </button>
          </div>
        </div>

        <SummaryCards summary={summary} />
        <FilterBar filters={filters} onChange={setFilters} />

        {error && <div className="alert-error">{error}</div>}

        <ShipmentTable shipments={shipments} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
