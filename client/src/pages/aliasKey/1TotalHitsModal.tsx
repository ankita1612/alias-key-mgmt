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
      icon: <FiBarChart2 size={18} />,
      color: "#3b82f6",
      isMain: true,
    },
    {
      label: "Success",
      value: successCount,
      icon: <FiCheckCircle size={18} />,
      color: "#10b981",
    },
    {
      label: "Limit Exceeded",
      value: data.total_limit_exceed || 0,
      icon: <FiAlertTriangle size={18} />,
      color: "#f59e0b",
    },
    {
      label: "Key Inactive",
      value: data.total_key_not_active || 0,
      icon: <FiLock size={18} />,
      color: "#ef4444",
    },
    {
      label: "Server Errors",
      value: data.total_internal_server || 0,
      icon: <FiServer size={18} />,
      color: "#dc2626",
    },
    {
      label: "Invalid Parameter",
      value: data.total_invalid_params || 0,
      icon: <FiSlash size={18} />,
      color: "#8b5cf6",
    },
    {
      label: "Invalid Proxy Key",
      value: data.total_invalid_proxy || 0,
      icon: <FiShield size={18} />,
      color: "#6366f1",
    },
    {
      label: "External Server Errors",
      value: data.total_extrenal_error || 0,
      icon: <FiXCircle size={18} />,
      color: "#ea580c",
    },
  ];

  const getPercentage = (value: number) => {
    return totalRequests > 0 ? (value / totalRequests) * 100 : 0;
  };

  const getSuccessRateColor = () => {
    if (successRate >= 80) return "#10b981";
    if (successRate >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute z-10 flex items-center justify-center w-10 h-10 transition-all duration-200 bg-white top-4 right-4 hover:text-gray-600 group"
        >
          <MdClose className="w-4 h-4 transition-transform group-hover:scale-110" />
        </button>

        {/* Header - Unchanged */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Key Hits Summary
          </h2>
        </div>

        {/* Content - Clean & Readable */}
        <div className="flex-1 px-8 py-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {/* Success Rate Overview */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-secondary"></div>
              <h3 className="text-sm font-medium text-gray-700">Overview</h3>
            </div>

            <div className="bg-gray-50 p-4 rounded border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Success Rate</div>
                  <div
                    className="text-2xl font-semibold"
                    style={{ color: getSuccessRateColor() }}
                  >
                    {successRate.toFixed(1)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">
                    Total Requests
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {totalRequests.toLocaleString()}
                  </div>
                </div>
              </div>
              {/* Simple progress bar */}
              <div className="mt-3">
                <div className="w-full h-1.5 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    className="h-full transition-all duration-700 rounded-full"
                    style={{
                      width: `${successRate}%`,
                      backgroundColor: getSuccessRateColor(),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-secondary"></div>
              <h3 className="text-sm font-medium text-gray-700">
                Request Breakdown
              </h3>
            </div>

            <div className="space-y-3">
              {stats.map((item, idx) => {
                const percentage = getPercentage(item.value);
                const isMain = item.label === "Total Requests";

                if (isMain) return null; // Skip Total Requests as it's shown above

                return (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="transition-colors group-hover:opacity-80"
                          style={{ color: item.color }}
                        >
                          {item.icon}
                        </div>
                        <span className="text-sm text-gray-700">
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900">
                          {item.value.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 min-w-[45px] text-right">
                          {percentage > 0 && percentage < 0.1
                            ? "<0.1%"
                            : `${percentage.toFixed(1)}%`}
                        </span>
                      </div>
                    </div>
                    {/* Subtle progress bar */}
                    <div className="w-full h-1 overflow-hidden bg-gray-100 rounded-full">
                      <div
                        className="h-full transition-all duration-700 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100"></div>

        {/* Footer - Unchanged */}
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
