import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div className="spinner"></div>;
  return isLoggedIn() ? children : <Navigate to="/login" />;
}

export function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="spinner"></div>;
  return isAdmin() ? children : <Navigate to="/" />;
}
