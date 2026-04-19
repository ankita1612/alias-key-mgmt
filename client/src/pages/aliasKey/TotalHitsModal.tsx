import { MdClose } from "react-icons/md";
import {
  FiBarChart2,
  FiCheckCircle,
  FiAlertTriangle,
  FiLock,
  FiXCircle,
  FiServer,
  FiSlash,
  FiShield,
  FiTrendingUp,
  FiActivity,
} from "react-icons/fi";

interface TotalHitsModalProps {
  data: IAliasKey;
  onClose: () => void;
}

function TotalHitsModal({ data, onClose }: TotalHitsModalProps) {
  const totalRequests = data.total_history_records || 0;
  const successCount = data.total_success || 0;
  const successRate =
    totalRequests > 0 ? (successCount / totalRequests) * 100 : 0;

  const stats = [
    {
      label: "Total Requests",
      value: totalRequests,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      icon: <FiBarChart2 size={20} />,
    },
    {
      label: "Success",
      value: successCount,
      color: "#10b981",
      bgColor: "#ecfdf5",
      icon: <FiCheckCircle size={20} />,
    },
    {
      label: "Limit Exceeded",
      value: data.total_limit_exceed || 0,
      color: "#f59e0b",
      bgColor: "#fffbeb",
      icon: <FiAlertTriangle size={20} />,
    },
    {
      label: "Key Inactive",
      value: data.total_key_not_active || 0,
      color: "#ea580c",
      bgColor: "#fff7ed",
      icon: <FiLock size={20} />,
    },
    {
      label: "Server Errors",
      value: data.total_internal_server || 0,
      color: "#ef4444",
      bgColor: "#fef2f2",
      icon: <FiServer size={20} />,
    },
    {
      label: "Invalid Parameter",
      value: data.total_invalid_params || 0,
      color: "#8b5cf6",
      bgColor: "#f5f3ff",
      icon: <FiSlash size={20} />,
    },
    {
      label: "Invalid Proxy Key",
      value: data.total_invalid_proxy || 0,
      color: "#6366f1",
      bgColor: "#eef2ff",
      icon: <FiShield size={20} />,
    },
    {
      label: "External Server Errors",
      value: data.total_extrenal_error || 0,
      color: "#dc2626",
      bgColor: "#fef2f2",
      icon: <FiXCircle size={20} />,
    },
  ];

  const getPercentage = (value: number) => {
    return totalRequests > 0 ? (value / totalRequests) * 100 : 0;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute z-10 flex items-center justify-center w-10 h-10 transition-all duration-200 bg-white top-4 right-4 hover:text-gray-600 hover:bg-gray-100 group"
        >
          <MdClose className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>

        <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Request Analytics
          </h2>
        </div>

        {/* Scrollable Content - Includes Success Rate Banner and Stats */}
        <div className="flex-1 px-6 overflow-y-auto custom-scrollbar">
          {/* Success Rate Banner */}
          <div className="pt-2 pb-2">
            <div className="p-2 border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FiTrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Success Rate
                  </span>
                </div>
                <span className="text-2xl font-bold text-blue-500">
                  {successRate.toFixed(1)}%
                </span>
              </div>
              <div className="relative">
                <div className="w-full h-2 overflow-hidden bg-blue-100 rounded-full">
                  <div
                    className="h-full transition-all duration-1000 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section - 2 Columns */}
          <div className="pb-4">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {stats.map((item, idx) => {
                const percentage = getPercentage(item.value);
                const isTotal = item.label === "Total Requests";

                return (
                  <div
                    key={idx}
                    className="p-4 transition-all duration-200 bg-white border border-gray-100 group rounded-xl hover:shadow-md hover:border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 transition-all rounded-lg group-hover:scale-110"
                          style={{ backgroundColor: item.bgColor }}
                        >
                          <div style={{ color: item.color }}>{item.icon}</div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700">
                            {item.label}
                          </p>
                          <p className="text-base font-bold text-gray-900">
                            {item.value.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {!isTotal && (
                        <div className="text-right">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: item.color }}
                          >
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {!isTotal && (
                      <div className="mt-2">
                        <div className="w-full h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full transition-all duration-700 rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Total Requests indicator */}
                    {/* {isTotal && (
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span>Base metric</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    )} */}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100"></div>
        <div className="flex justify-end px-6 py-4">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-gray-100 rounded-lg hover:bg-gray-200 hover:shadow-sm active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TotalHitsModal;
