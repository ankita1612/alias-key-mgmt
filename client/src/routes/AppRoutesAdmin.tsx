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

const AppRoutes = () => {
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

        <Route path="alias-key" element={<AliasKeyList />} />
        <Route path="alias-key/add" element={<AliasKeyAdd />} />
        <Route path="alias-key/add/:id?" element={<AliasKeyAdd />} />
        <Route path="proxy" element={<ProxyList />} />
        <Route path="proxy/add" element={<ProxyAdd />} />
        <Route path="proxy/add/:id?" element={<ProxyAdd />} />

        <Route path="api-history/:aliasKeyId?" element={<ApiHistory />} />

        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
