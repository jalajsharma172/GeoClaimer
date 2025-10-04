import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { googleUser, walletAddress } = useAuth();
  const location = useLocation();

  if (!googleUser || !walletAddress) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;