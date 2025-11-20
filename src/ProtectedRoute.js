import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, isAuthenticated } = useAuth();
  console.log("ProtectedRoute - checking access:", user, isAuthenticated());

  if (!isAuthenticated()) {
    console.log("ProtectedRoute - no token, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    console.log("ProtectedRoute - user not loaded yet");
    return null;
  }

  console.log("ProtectedRoute - access granted");
  return children;
}
