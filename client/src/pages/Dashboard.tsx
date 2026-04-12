import { useAuth } from "../context/AuthContext";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";
function Dashboard() {
  const { user } = useAuth();
  return <>{user?.role === "User" ? <UserDashboard /> : <AdminDashboard />}</>;
}

export default Dashboard;
