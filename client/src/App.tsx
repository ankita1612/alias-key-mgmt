import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import AppRoutesAdmin from "./routes/AppRoutesAdmin";

import { Routes, Route, Navigate } from "react-router-dom";
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/*" element={<AppRoutesAdmin />} />
      </Routes>

      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          top: 16,
          right: 16,
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 4000,

          style: {
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: 500,
            maxWidth: "380px",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow:
              "0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.04)",
            fontFamily:
              "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          },
          success: {
            style: {
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              border: "1px solid #86efac",
              color: "#14532d",
            },
          },
          error: {
            style: {
              background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
              border: "1px solid #fca5a5",
              color: "#991b1b",
            },
          },
          loading: {
            style: {
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              border: "1px solid #cbd5e1",
              color: "#334155",
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
