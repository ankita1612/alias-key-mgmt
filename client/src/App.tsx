import { AuthProvider } from "./context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import AppRoutesAdmin from "./routes/AppRoutesAdmin";
import { Routes, Route, Navigate } from "react-router-dom";
import { FiInfo } from "react-icons/fi";
import CustomToast from "./utils/CustomToast";

toast.info = (message: string) =>
  toast(message, {
    duration: 4000,
    icon: <FiInfo size={18} className="text-blue-500" />,
  });

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/*" element={<AppRoutesAdmin />} />
      </Routes>

      {/* ✅ Correct Toaster */}
      <Toaster position="top-right" gutter={8}>
        {(t) => <CustomToast t={t} />}
      </Toaster>
    </AuthProvider>
  );
}

export default App;
