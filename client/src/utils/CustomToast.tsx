import { useEffect, useState } from "react";

type ToastType = {
  id: string;
  message: string;
  visible: boolean;
  type?: string;
  duration?: number;
  icon?: React.ReactNode;
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

  const color = getColor(t.type);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setProgress(1));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${t.visible ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"}
        w-[260px] bg-white/90 backdrop-blur-md
        shadow-lg rounded-xl border border-gray-200 overflow-hidden
        hover:shadow-xl
      `}
    >
      {/* Content */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        /> */}
        {t.icon}
        <p className="flex-1 text-sm font-medium text-gray-800">{t.message}</p>
      </div>

      {/* Progress Bar */}
      <div className="h-[3px] w-full bg-gray-200 overflow-hidden">
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
