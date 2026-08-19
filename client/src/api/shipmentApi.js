import api from './axios';

// Thin wrappers around the shipment endpoints - mirrors authApi.js's pattern.
// `params` is passed straight through to axios as query string params, so
// callers can do getShipments({ status: 'In Transit', search: 'ST-2026' }).
export const getShipments = async (params = {}) => {
  const { data } = await api.get('/shipments', { params });
  return data;
};

export const getShipmentSummary = async () => {
  const { data } = await api.get('/shipments/summary');
  return data;
};

export const getShipmentById = async (id) => {
  const { data } = await api.get(`/shipments/${id}`);
  return data;
};

export const createShipment = async (shipment) => {
  const { data } = await api.post('/shipments', shipment);
  return data;
};

export const updateShipment = async (id, updates) => {
  const { data } = await api.put(`/shipments/${id}`, updates);
  return data;
};

export const deleteShipment = async (id) => {
  const { data } = await api.delete(`/shipments/${id}`);
  return data;
};

export const addStatusUpdate = async (id, entry) => {
  const { data } = await api.post(`/shipments/${id}/history`, entry);
  return data;
};

export const updateStatusEntry = async (id, historyId, updates) => {
  const { data } = await api.patch(`/shipments/${id}/history/${historyId}`, updates);
  return data;
};

export const deleteStatusEntry = async (id, historyId) => {
  const { data } = await api.delete(`/shipments/${id}/history/${historyId}`);
  return data;
};
