import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

const PrivateRoute = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // If user is logged in, render the child route, otherwise navigate to login
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;