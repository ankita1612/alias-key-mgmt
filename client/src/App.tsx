import { AuthProvider } from "./context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import AppRoutesAdmin from "./routes/AppRoutesAdmin";
import { Routes, Route, Navigate } from "react-router-dom";
import CustomToast from "./utils/CustomToast";
import { FiInfo, FiXCircle } from "react-icons/fi";
import { HiCheckCircle, HiXCircle, HiInformationCircle } from "react-icons/hi";

toast.info = (message: string) =>
  toast(message, {
    duration: 2000,
    icon: <HiInformationCircle className="text-blue-500 w-7 h-7" />,
  });
// Success
toast.success = (message: string) =>
  toast(message, {
    duration: 2000,
    icon: <HiCheckCircle className="text-green-400 w-7 h-7" />,
    styleType: "success",
  });

// Error
toast.error = (message: string) =>
  toast(message, {
    duration: 2000,
    icon: <HiXCircle className="text-red-500 w-7 h-7" />,
    styleType: "error",
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
