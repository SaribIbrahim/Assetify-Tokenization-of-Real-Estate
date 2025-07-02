import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("user"); // Check if user is logged in

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default PublicRoute;
