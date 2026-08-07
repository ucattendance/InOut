// src/components/ProtectedRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;

  if (!token) {
    return <Navigate to="/login" replace state={{ from: returnTo }} />;
  }

  try {
    jwtDecode(token);
    // Access-token expiry is enforced by the API layer (axios interceptor
    // silently refreshes via the httpOnly refresh cookie) — don't bounce to
    // /login here just because the short-lived access token has expired.
    return children;
  } catch (err) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace state={{ from: returnTo }} />;
  }
}

export default ProtectedRoute;
