import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const loginPathByRole = {
  student: '/student/login',
  trainer: '/trainer/login',
  admin: '/admin/login',
};

export default function ProtectedRoute({ allowedRole, children }) {
  const { role } = useAuth();
  if (role !== allowedRole) {
    return <Navigate to={loginPathByRole[allowedRole] || '/admin/login'} replace />;
  }
  return children;
}
