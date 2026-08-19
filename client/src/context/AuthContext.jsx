import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchCurrentUser } from '../api/authApi';

const AuthContext = createContext(null);

// Custom hook so components do `const { user, login } = useAuth()` instead
// of importing useContext + AuthContext everywhere.
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Starts true: on first load we don't yet know if a saved token is still
  // valid, so every protected route needs to wait for this check before
  // deciding to redirect to /login or not.
  const [loading, setLoading] = useState(true);

  // On app load, if a token is already saved (from a previous session),
  // verify it's still valid by calling /auth/me rather than trusting
  // whatever stale user object might be in localStorage.
  useEffect(() => {
    const token = localStorage.getItem('shiptrack_token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetchCurrentUser()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem('shiptrack_token');
        localStorage.removeItem('shiptrack_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    localStorage.setItem('shiptrack_token', data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
    return data;
  };

  const signup = async (details) => {
    const data = await registerUser(details);
    localStorage.setItem('shiptrack_token', data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('shiptrack_token');
    localStorage.removeItem('shiptrack_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
