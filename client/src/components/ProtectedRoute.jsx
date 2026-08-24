import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const roleHome = {
  ORGANIZADOR: '/organizador',
  CLIENTE: '/',
  PORTARIA: '/portaria',
};

function ProtectedRoute({ role, children }) {
  const { user } = useAuth();

  if (!user) {
    return <LoginModal />;
  }

  if (role && user.role !== role) {
    return <Navigate to={roleHome[user.role]} replace />;
  }

  return children;
}

export default ProtectedRoute;