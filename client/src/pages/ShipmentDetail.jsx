import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getShipmentById,
  updateShipment,
  deleteShipment,
  addStatusUpdate,
  updateStatusEntry,
  deleteStatusEntry,
} from '../api/shipmentApi';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import AddStatusUpdateForm from '../components/AddStatusUpdateForm';

const ShipmentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingDetails, setEditingDetails] = useState(false);
  const [detailsForm, setDetailsForm] = useState(null);
  const [savingDetails, setSavingDetails] = useState(false);

  const load = () => {
    setLoading(true);
    return getShipmentById(id)
      .then((data) => {
        setShipment(data);
        setError('');
      })
      .catch((err) => {
        setError(
          err.response?.status === 404
            ? 'Shipment not found.'
            : 'Failed to load shipment. Please try again.'
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const startEditingDetails = () => {
    setDetailsForm({
      origin: shipment.origin,
      destination: shipment.destination,
      carrier: shipment.carrier,
      // <input type="date"> needs YYYY-MM-DD, not a full ISO timestamp
      estimatedDelivery: shipment.estimatedDelivery
        ? shipment.estimatedDelivery.slice(0, 10)
        : '',
    });
    setEditingDetails(true);
  };

  const saveDetails = async () => {
    setSavingDetails(true);
    try {
      const updated = await updateShipment(id, detailsForm);
      setShipment(updated);
      setEditingDetails(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update shipment.');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleAddStatus = async (entry) => {
    const updated = await addStatusUpdate(id, entry);
    setShipment(updated);
  };

  const handleUpdateEntry = async (historyId, updates) => {
    const updated = await updateStatusEntry(id, historyId, updates);
    setShipment(updated);
  };

  const handleDeleteEntry = async (historyId) => {
    const updated = await deleteStatusEntry(id, historyId);
    setShipment(updated);
  };

  const handleDeleteShipment = async () => {
    if (!window.confirm(`Delete shipment ${shipment.trackingId}? This cannot be undone.`)) return;
    await deleteShipment(id);
    navigate('/dashboard', { replace: true });
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-slate-500">Loading...</div>;
  }

  if (error && !shipment) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-lg mx-auto">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-slate-600 hover:underline">
            ← Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">
            ← Back to dashboard
          </Link>
          {isAdmin && (
            <button
              onClick={handleDeleteShipment}
              className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-md px-3 py-1.5"
            >
              Delete shipment
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {/* Shipment details card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-slate-900">{shipment.trackingId}</h1>
            <div className="flex items-center gap-2">
              <StatusBadge status={shipment.status} />
              {isAdmin && !editingDetails && (
                <button
                  onClick={startEditingDetails}
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {editingDetails ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Origin</label>
                  <input
                    type="text"
                    value={detailsForm.origin}
                    onChange={(e) => setDetailsForm({ ...detailsForm, origin: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Destination</label>
                  <input
                    type="text"
                    value={detailsForm.destination}
                    onChange={(e) => setDetailsForm({ ...detailsForm, destination: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Carrier</label>
                  <input
                    type="text"
                    value={detailsForm.carrier}
                    onChange={(e) => setDetailsForm({ ...detailsForm, carrier: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Est. delivery</label>
                  <input
                    type="date"
                    value={detailsForm.estimatedDelivery}
                    onChange={(e) =>
                      setDetailsForm({ ...detailsForm, estimatedDelivery: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveDetails}
                  disabled={savingDetails}
                  className="text-sm bg-slate-900 text-white rounded-md px-4 py-1.5 font-medium disabled:opacity-50"
                >
                  {savingDetails ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  onClick={() => setEditingDetails(false)}
                  className="text-sm text-slate-600 border border-slate-300 rounded-md px-4 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Origin</dt>
                <dd className="text-slate-900 font-medium">{shipment.origin}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Destination</dt>
                <dd className="text-slate-900 font-medium">{shipment.destination}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Carrier</dt>
                <dd className="text-slate-900 font-medium">{shipment.carrier}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Est. delivery</dt>
                <dd className="text-slate-900 font-medium">
                  {shipment.estimatedDelivery
                    ? new Date(shipment.estimatedDelivery).toLocaleDateString()
                    : '—'}
                </dd>
              </div>
            </dl>
          )}
        </div>

        {/* Timeline card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Status timeline</h2>
          <Timeline
            history={shipment.statusHistory}
            isAdmin={isAdmin}
            onUpdate={handleUpdateEntry}
            onDelete={handleDeleteEntry}
          />

          {isAdmin && <AddStatusUpdateForm onAdd={handleAddStatus} />}
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetail;
