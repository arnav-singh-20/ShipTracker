import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getShipments, getShipmentSummary } from '../api/shipmentApi';
import SummaryCards from '../components/SummaryCards';
import FilterBar from '../components/FilterBar';
import ShipmentTable from '../components/ShipmentTable';

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
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">ShipTrack Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {user?.name} · {user?.role === 'admin' ? 'Admin (all shipments)' : 'Your shipments'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/shipments/new"
              className="bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-800 transition"
            >
              + New shipment
            </Link>
            <button
              onClick={logout}
              className="text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md px-3 py-2"
            >
              Log out
            </button>
          </div>
        </div>

        <SummaryCards summary={summary} />
        <FilterBar filters={filters} onChange={setFilters} />

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <ShipmentTable shipments={shipments} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
