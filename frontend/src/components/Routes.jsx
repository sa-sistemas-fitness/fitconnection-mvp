import { LoaderCircle } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[#05060d]"><LoaderCircle className="size-8 animate-spin text-blue-400" /></div>;
  }
  return user ? children : <Navigate replace state={{ from: location.pathname }} to="/login" />;
}

export function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  return roles.some((role) => user?.roles.includes(role))
    ? children
    : <Navigate replace to="/panel" />;
}

export function ApprovedTrainerRoute({ children }) {
  const { user } = useAuth();
  const approved =
    user?.roles.includes("Entrenador") &&
    user?.entrenador?.estado?.nombre === "Aprobado";
  return approved ? children : <Navigate replace to="/portal-entrenador" />;
}
