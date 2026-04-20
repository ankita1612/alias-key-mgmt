import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiX } from "react-icons/fi";
type ToastType = {
  id: string;
  message: string;
  visible: boolean;
  type?: string;
  duration?: number;
  icon?: React.ReactNode;
  styleType?: "success" | "error" | "info" | "loading";
};

const CustomToast = ({ t }: { t: ToastType }) => {
  const duration = t.duration || 4000;

  const getColor = (type?: string) => {
    switch (type) {
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "loading":
        return "#3b82f6";
      default:
        return "#6366f1";
    }
  };

  //const color = getColor(t.type);
  const color = getColor(t.styleType);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setProgress(1));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`
    relative   // ✅ ADD THIS (important)
    transform transition-all duration-200 ease-out
${t.visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
    min-w-[280px] max-w-[400px] bg-white/90 backdrop-blur-md
    shadow-lg rounded-xl border border-gray-200 overflow-hidden
    hover:shadow-xl
  `}
    >
      <button
        onClick={() => toast.dismiss(t.id)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
      >
        <FiX size={16} />
      </button>
      {/* Content */}
      <div className="flex items-center gap-1 px-4 py-3">
        {t.icon}
        <p className="flex-1 text-[15px] font-medium text-gray-500">
          {t.message}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[4px] bg-gray-200">
        <div
          className="h-full origin-left"
          style={{
            backgroundColor: color,
            transform: `scaleX(${progress})`,
            transition: `transform ${duration}ms linear`,
          }}
        />
      </div>
    </div>
  );
};

export default CustomToast;
