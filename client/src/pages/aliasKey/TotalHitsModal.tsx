import { X } from "lucide-react";
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
} from "react-icons/fi";
interface TotalHitsModalProps {
  data: IAliasKey;
  onClose: () => void;
}

function TotalHitsModal({ data, onClose }: TotalHitsModalProps) {
  const stats = [
    {
      label: "Total Requests",
      value: data.total_history_records,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: <FiBarChart2 />,
    },
    {
      label: "Success",
      value: data.total_success,
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: <FiCheckCircle />,
    },
    {
      label: "Limit Exceeded",
      value: data.total_limit_exceed,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      icon: <FiAlertTriangle />,
    },
    {
      label: "Key Inactive",
      value: data.total_key_not_active,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      icon: <FiLock />,
    },
    {
      label: "Server Errors",
      value: data.total_internal_server,
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: <FiServer />,
    },
    {
      label: "Invalid Parameter",
      value: data.total_invalid_params,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      icon: <FiSlash />,
    },
    {
      label: "Invalid Proxy Key",
      value: data.total_invalid_proxy,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      icon: <FiShield />,
    },
    {
      label: "External Server Errors",
      value: data.total_extrenal_error,
      color: "text-red-700",
      bgColor: "bg-red-100",
      icon: <FiXCircle />,
    },
  ];

  // Calculate total and success rate
  const totalRequests = data.total_history_records || 0;
  const successCount = data.total_success || 0;

  const successRate =
    totalRequests > 0
      ? ((successCount / totalRequests) * 100).toFixed(2)
      : "0.00";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-2xl overflow-hidden transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute z-10 flex items-center justify-center w-10 h-10  transition-all duration-200 bg-white top-4 right-4 hover:text-gray-600 hover:bg-gray-100 group"
        >
          <MdClose className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>

        <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Total hits overview
          </h2>
        </div>

        {/* Success Rate Banner */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Success Rate
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {successRate}%
              </span>
            </div>
            <div className="w-full h-2 overflow-hidden bg-blue-100 rounded-full">
              <div
                className="h-full transition-all duration-500 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid - Improved */}
        <div className="px-6 pt-2 pb-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((item, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden p-4 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${item.bgColor} border-gray-100`}
              >
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 bg-gradient-to-br from-white/50 to-transparent group-hover:opacity-100" />

                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <span className="text-xl opacity-50">{item.icon}</span>
                  </div>
                  <p
                    className={`text-2xl font-bold ${item.color} transition-all duration-300 group-hover:scale-105 origin-left`}
                  >
                    {(item.value ?? 0).toLocaleString()}
                  </p>
                  {/* Mini trend indicator */}
                  <div className="mt-2 text-sm text-gray-400">
                    {item.label === "Total Requests" && "All time"}
                    {item.label === "Success" && `${successRate}% of total`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Insights Section */}

        <div className="border-t border-slate-200 px-6 py-2"></div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 px-6 pb-4 sm:flex-row">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-200 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 hover:shadow-md active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TotalHitsModal;
