import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[]; // 👈 add this
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <></>
      // <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      //   <div className="flex flex-col items-center gap-3">
      //     <div className="w-10 h-10 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
      //     <p className="text-sm text-white">Loading...</p>
      //   </div>
      // </div>
    );
  }

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Role not allowed
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
