import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return <div>Loading...</div>; // хотя бы заглушка
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
