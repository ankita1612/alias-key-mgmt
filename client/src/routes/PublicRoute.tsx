import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
interface PublicRouteProps {
  children: React.ReactNode;
}
const PublicRoute = ({ children }: { children: PublicRouteProps }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
          <p className="text-sm text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
