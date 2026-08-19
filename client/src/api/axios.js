import axios from 'axios';

// Single shared axios instance for the whole app. Two things live here that
// every request needs, so they belong in one place rather than repeated
// per-call: the base URL, and attaching the JWT.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor: reads the token from localStorage and attaches it
// as a Bearer header on every outgoing request. This means individual
// components/pages never have to think about auth headers - they just
// call api.get(...) and it's handled.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shiptrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: if the API ever returns 401 (token missing/expired/
// invalid), clear the stale session and bounce to login. This handles the
// case where a token expires mid-session without every single page having
// to check for it manually.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('shiptrack_token');
      localStorage.removeItem('shiptrack_user');
      // Full reload (not client-side navigate) so all component state
      // resets cleanly - simplest correct behavior for a "session died" case.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
