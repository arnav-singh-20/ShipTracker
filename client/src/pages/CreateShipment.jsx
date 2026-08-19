import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createShipment } from '../api/shipmentApi';

const CreateShipment = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    origin: '',
    destination: '',
    carrier: '',
    estimatedDelivery: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const shipment = await createShipment(form);
      // Land directly on the new shipment's detail page so the user
      // immediately sees the tracking ID that was auto-generated for them.
      navigate(`/shipments/${shipment._id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shipment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-lg mx-auto">
        <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 mb-4 inline-block">
          ← Back to dashboard
        </Link>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">New shipment</h1>
          <p className="text-sm text-slate-500 mb-6">
            A tracking ID will be generated automatically.
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Origin</label>
              <input
                type="text"
                name="origin"
                required
                value={form.origin}
                onChange={handleChange}
                placeholder="Shanghai, CN"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
              <input
                type="text"
                name="destination"
                required
                value={form.destination}
                onChange={handleChange}
                placeholder="Los Angeles, US"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Carrier</label>
              <input
                type="text"
                name="carrier"
                required
                value={form.carrier}
                onChange={handleChange}
                placeholder="Maersk"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Estimated delivery <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                name="estimatedDelivery"
                value={form.estimatedDelivery}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {submitting ? 'Creating...' : 'Create shipment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateShipment;
