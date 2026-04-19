import { AuthProvider } from "./context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import AppRoutesAdmin from "./routes/AppRoutesAdmin";

import { Routes, Route, Navigate } from "react-router-dom";
import { FiInfo } from "react-icons/fi";
toast.info = (message: string) =>
  toast(message, {
    duration: 4000,
    icon: <FiInfo size={18} className="text-blue-500" />, // ✅ React icon here
    style: {
      background: "#eff6ff",
      color: "#1e40af",
      borderLeft: "4px solid #3b82f6",
      border: "1px solid #bfdbfe",
    },
  });
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
          top: 20,
          right: 20,
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#1f2937",
            borderRadius: "12px",
            padding: "14px 18px",
            fontSize: "14px",
            fontWeight: 500,
            maxWidth: "420px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            fontFamily:
              'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            display: "flex",
            alignItems: "center",
            gap: "12px",
            border: "1px solid #e5e7eb",
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
            style: {
              background: "#f0fdf4",
              color: "#166534",
              borderLeft: "4px solid #10b981",
              border: "1px solid #bbf7d0",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
            style: {
              background: "#fef2f2",
              color: "#991b1b",
              borderLeft: "4px solid #ef4444",
              border: "1px solid #fecaca",
            },
          },
          loading: {
            duration: 3000,
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#ffffff",
            },
            style: {
              background: "#eff6ff",
              color: "#1e40af",
              borderLeft: "4px solid #3b82f6",
              border: "1px solid #bfdbfe",
            },
          },
          blank: {
            duration: 3000,
            style: {
              background: "#ffffff",
              color: "#374151",
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
