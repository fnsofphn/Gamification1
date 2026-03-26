import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getViewerAccess } from '../lib/access';

type RequireAccessProps = {
  role?: 'manager' | 'learner';
};

export default function RequireAccess({ role }: RequireAccessProps) {
  const location = useLocation();
  const access = getViewerAccess();

  if (!access) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (role && access.role !== role) {
    return <Navigate to="/games" replace />;
  }

  return <Outlet />;
}

