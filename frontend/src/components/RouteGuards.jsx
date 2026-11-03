import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoadingScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-mist-300">Loading...</p>
    </main>
  );
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

export function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/" replace /> : children;
}
