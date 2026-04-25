import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const isAdmin = sessionStorage.getItem("adminSession") === "true";
  return isAdmin ? <>{children}</> : <Navigate to="/admin" replace />;
}
