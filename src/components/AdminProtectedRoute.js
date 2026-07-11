import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/** Admin layout routes — requires valid token with role `admin`. */
function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    // Access-token expiry is enforced by the API layer (axios interceptor
    // silently refreshes via the httpOnly refresh cookie) — don't bounce to
    // /login here just because the short-lived access token has expired.

    if (decoded.role !== 'admin') {
      return <Navigate to="/attendance" replace state={{ adminDenied: true }} />;
    }

    return children;
  } catch {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
}

export default AdminProtectedRoute;
