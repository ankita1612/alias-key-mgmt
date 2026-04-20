import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/user/AdminLayout";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import PageNotFound from "../pages/PageNotFound";
import ChangePassword from "../pages/ChangePassword";
import AliasKeyList from "../pages/aliasKey/AliasKeyList";
import AliasKeyAdd from "../pages/aliasKey/AliasKeyAdd";
import ProxyList from "../pages/proxy/ProxyList";
import ProxyAdd from "../pages/proxy/ProxyAdd";
import ApiHistory from "../pages/apiHistory/ApiHistory";
import ApiHistoryView from "../pages/apiHistory/ApiHistoryView";
import KeyMonitor from "../pages/apiHistory/KeyMonitor";
import { useAuth } from "../context/AuthContext";

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route
        path="login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="change_password" element={<ChangePassword />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="key-monitor" element={<KeyMonitor />} />
        <Route path="alias-key" element={<AliasKeyList />} />
        <Route path="alias-key/add" element={<AliasKeyAdd />} />
        <Route path="alias-key/add/:id?" element={<AliasKeyAdd />} />
        <Route
          path="proxy"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <ProxyList />
            </ProtectedRoute>
          }
        />
        <Route
          path="proxy/add"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <ProxyAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="proxy/add/:id?"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <ProxyAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="api-history/view/:apiHistoryId"
          element={<ApiHistoryView />}
        />
        <Route path="api-history/:aliasKeyId" element={<ApiHistory />} />
        <Route path="api-monotor" element={<KeyMonitor />} />

        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
