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
import '../styles/app-theme.css';

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
    return (
      <div className="app-shell">
        <div className="app-wrap narrow">
          <p className="loading-state">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !shipment) {
    return (
      <div className="app-shell">
        <div className="app-wrap narrow">
          <div className="alert-error">{error}</div>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            ← Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-wrap narrow">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <Link to="/dashboard" className="back-link" style={{ marginBottom: 0 }}>
            ← Back to dashboard
          </Link>
          {isAdmin && (
            <button onClick={handleDeleteShipment} className="btn-danger">
              Delete shipment
            </button>
          )}
        </div>

        {error && <div className="alert-error">{error}</div>}

        {/* Shipment details card */}
        <div className="panel detail-card">
          <div className="detail-head">
            <h1>{shipment.trackingId}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <StatusBadge status={shipment.status} />
              {isAdmin && !editingDetails && (
                <button onClick={startEditingDetails} className="btn-ghost">
                  Edit
                </button>
              )}
            </div>
          </div>

          {editingDetails ? (
            <div>
              <div className="form-grid-2">
                <div className="form-field">
                  <label>Origin</label>
                  <input
                    type="text"
                    value={detailsForm.origin}
                    onChange={(e) => setDetailsForm({ ...detailsForm, origin: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Destination</label>
                  <input
                    type="text"
                    value={detailsForm.destination}
                    onChange={(e) => setDetailsForm({ ...detailsForm, destination: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Carrier</label>
                  <input
                    type="text"
                    value={detailsForm.carrier}
                    onChange={(e) => setDetailsForm({ ...detailsForm, carrier: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Est. delivery</label>
                  <input
                    type="date"
                    value={detailsForm.estimatedDelivery}
                    onChange={(e) =>
                      setDetailsForm({ ...detailsForm, estimatedDelivery: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={saveDetails} disabled={savingDetails} className="btn-primary">
                  {savingDetails ? 'Saving...' : 'Save changes'}
                </button>
                <button onClick={() => setEditingDetails(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <dl className="detail-grid">
              <div>
                <dt>Origin</dt>
                <dd>{shipment.origin}</dd>
              </div>
              <div>
                <dt>Destination</dt>
                <dd>{shipment.destination}</dd>
              </div>
              <div>
                <dt>Carrier</dt>
                <dd>{shipment.carrier}</dd>
              </div>
              <div>
                <dt>Est. delivery</dt>
                <dd>
                  {shipment.estimatedDelivery
                    ? new Date(shipment.estimatedDelivery).toLocaleDateString()
                    : '—'}
                </dd>
              </div>
            </dl>
          )}
        </div>

        {/* Timeline card */}
        <div className="panel detail-card" style={{ marginBottom: 0 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '15px', marginBottom: '18px' }}>
            Status timeline
          </h2>
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
