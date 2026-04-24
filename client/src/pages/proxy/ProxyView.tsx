import StatusBadge from "../../utils/StatusBadge";
import {
  heading_label_style,
  label_style,
  label_style_bold,
  input_style,
  input_style_with_gray_border,
} from "../../utils/CommonFn";

import {
  XCircle,
  Clock,
  PlayCircle,
  PauseCircle,
  ArrowLeft,
  Key,
  Globe,
  AlertCircle,
  CheckCircle,
  Zap,
} from "lucide-react";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { FiAlertCircle } from "react-icons/fi";

// Move these components OUTSIDE of ProxyView
const InfoRow = ({ label, value, icon, isLink = false, isFull = false }) => (
  <div
    className={`flex items-start gap-3 p-3 bg-white rounded-lg ${isFull ? "md:col-span-2 lg:col-span-3" : ""}`}
  >
    <span className="text-xl">{icon || "📄"}</span>
    <div className="flex-1">
      <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
        {label}
      </p>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-indigo-600 break-all hover:text-indigo-700"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium text-gray-700 break-all">
          {value || "—"}
        </p>
      )}
    </div>
  </div>
);

// Enhanced StatCard component
const StatCard = ({ title, value, icon, color = "indigo" }) => {
  const colorClasses = {
    yellow: "from-yellow-400 to-orange-500",
    green: "from-green-400 to-emerald-500",
    red: "from-red-400 to-rose-500",
    emerald: "from-emerald-400 to-teal-500",
    gray: "from-gray-400 to-gray-500",
    indigo: "from-indigo-500 to-purple-600",
  };

  return (
    <div className={`p-[1.5px] rounded-xl bg- ${colorClasses[color]}`}>
      <div className="p-5 text-center bg-white rounded-xl">
        <p className="text-3xl font-bold text-gray-800">{value || 0}</p>
        <p className="mt-1 text-sm tracking-wide text-gray-500 uppercase">
          {title}
        </p>
      </div>
    </div>
  );
};

// Simple InfoRow for proxy details (without icon)
const ProxyInfoRow = ({ label, value, isLink = false }) => (
  <div className="py-1">
    <label className={label_style_bold}>{label}</label>
    {isLink ? (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-indigo-600 break-all hover:text-indigo-700"
      >
        {value || "-"}
      </a>
    ) : (
      <p className={input_style}>{value || "-"}</p>
    )}
  </div>
);

function ProxyView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/proxy/get-detail/${id}`);
        setData(res.data?.data);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading details...</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">Invalid Proxy</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-md shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-3 bg-primary">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* Accent line touching left border */}
          <div className="w-1 h-6 -ml-6 rounded-r-full bg-menuActive" />

          {/* Title */}
          <div>
            <h5 className=" sm:text-xl text-white/60">Proxy View</h5>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
          {/* PART 1: Proxy Detail Section */}
          <div className="overflow-hidden bg-white shadow-sm rounded-xl">
            {/* Card Header */}
            <div className="px-6 py-2 bg-slate-50">
              <div className="flex items-center gap-2">
                <h5 className={heading_label_style}>Proxy Detail</h5>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <ProxyInfoRow
                  label="Project"
                  value={data?.proxy?.project_name}
                />
                <ProxyInfoRow label="Domain" value={data?.proxy?.domain_name} />
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <ProxyInfoRow
                  label="Proxy Name"
                  value={data?.proxy?.proxy_name}
                />
                <ProxyInfoRow
                  label="Proxy Token"
                  value={data?.proxy?.proxy_token}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <ProxyInfoRow
                  label="Curl Token"
                  value={data?.proxy?.curl_token}
                />
                <ProxyInfoRow label="Credit" value={data?.proxy?.credit} />
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <ProxyInfoRow
                  label="Status"
                  value={data?.proxy?.is_deleted ? "Deleted" : "Active"}
                />
              </div>
              <div className="grid grid-cols-1 gap-5">
                <ProxyInfoRow label="Curl" value={data?.proxy?.curl} />
              </div>
              {data.proxy?.is_deleted && (
                <div className="p-3 border border-red-200 rounded bg-red-50">
                  <div className="flex items-center gap-2">
                    <FiAlertCircle className="w-4 h-4 text-red-500" />
                    <span className="p-0 text-sm text-red-700 rounded-lg bg-red-50">
                      This proxy has been deleted and is no longer available
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PART 2: Key Details Section - Modern Design */}
          <div className="overflow-hidden bg-white shadow-sm rounded-xl ">
            {/* Header with gradient accent */}
            <div className="px-6 py-2 bg-slate-50">
              <div className="flex items-center gap-2">
                <h5 className={heading_label_style}>Key Detail</h5>
              </div>
            </div>

            <div className="px-3 py-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* LEFT: KEY LIST - Adaptive height based on content */}
                <div
                  className={`lg:col-span-2 transition-all duration-300 ${
                    data?.aliasKeys?.length === 0 ? "lg:col-span-3" : ""
                  }`}
                >
                  <div
                    className={`overflow-hidden transition-all ${
                      data?.aliasKeys?.length > 0
                        ? "border rounded-xl border-gray-200 bg-gray-50"
                        : ""
                    }`}
                  >
                    {data?.aliasKeys?.length > 0 ? (
                      // Table view for data with independent scroll
                      <div className="relative flex flex-col h-full">
                        {/* Fixed Header - Adjusted column widths */}
                        <div className="flex-none bg-gray-100 rounded-t-xl">
                          <div className="grid grid-cols-12 gap-3 px-4 py-3">
                            <div className="col-span-6">
                              <div className="text-xs font-semibold tracking-wider text-left text-gray-600 ">
                                Key
                              </div>
                            </div>
                            <div className="col-span-3">
                              <div className="text-xs font-semibold tracking-wider text-left text-gray-600 ">
                                Status
                              </div>
                            </div>
                            <div className="col-span-3">
                              <div className="text-xs font-semibold tracking-wider text-left text-gray-600 ">
                                Approval Status
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Scrollable Body - Fixed height */}
                        <div
                          className="overflow-y-auto"
                          style={{ maxHeight: "230px" }}
                        >
                          <div className="divide-y divide-gray-100">
                            {data.aliasKeys.map((item: any, index: number) => (
                              <div
                                key={item._id}
                                className="grid grid-cols-12 gap-3 px-4 py-3 transition-all duration-200 bg-white hover:bg-gray-50 group"
                              >
                                {/* Key Column - More width */}
                                <div className="col-span-6">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm text-gray-700 break-all">
                                      {item.alias_key}
                                    </span>
                                  </div>
                                </div>

                                {/* Status Column */}
                                <div className="col-span-3">
                                  <StatusBadge
                                    status={item.key_status}
                                  ></StatusBadge>
                                </div>

                                {/* Approval Status Column */}
                                <div className="col-span-3">
                                  <StatusBadge
                                    status={item.approval_status}
                                  ></StatusBadge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Compact empty state
                      <div className="flex flex-col items-center justify-center px-4 py-4 text-center">
                        <h4 className="">No Keys Found</h4>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: STATISTICS - Hide when no keys */}
                {data?.aliasKeys?.length > 0 && (
                  <div className="space-y-5 animate-fadeIn">
                    {/* Header with icon */}

                    {/* Active Card - Modern design */}
                    <div className="p-4 space-y-3 transition-all duration-200 border rounded-xl border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="font-medium text-gray-700">
                            Active Keys
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-emerald-600">
                          {data?.stats?.active || 0}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 pt-2 text-sm border-t border-emerald-100">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Approved</p>
                          <p className="mt-1 font-bold text-green-600">
                            {data?.stats?.active_approved || 0}
                          </p>
                        </div>
                        <div className="text-center border-l border-r border-emerald-100">
                          <p className="text-xs text-gray-500">Pending</p>
                          <p className="mt-1 font-bold text-yellow-600">
                            {data?.stats?.active_pending || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Rejected</p>
                          <p className="mt-1 font-bold text-red-600">
                            {data?.stats?.active_rejected || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Inactive Card - Modern design */}
                    <div className="p-4 space-y-3 transition-all duration-200 border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="font-medium text-gray-700">
                            Inactive Keys
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-gray-600">
                          {data?.stats?.inactive || 0}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 pt-2 text-sm border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Approved</p>
                          <p className="mt-1 font-bold text-gray-600">
                            {data?.stats?.inactive_approved || 0}
                          </p>
                        </div>
                        <div className="text-center border-l border-r border-gray-200">
                          <p className="text-xs text-gray-500">Pending</p>
                          <p className="mt-1 font-bold text-yellow-600">
                            {data?.stats?.inactive_pending || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Rejected</p>
                          <p className="mt-1 font-bold text-red-600">
                            {data?.stats?.inactive_rejected || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 rounded-lg shadow-sm bg-primary hover:bg-primaryHover"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            {/* Pulsing Circle */}
            <div className="w-12 h-12 border-4 rounded-full border-primary/30 border-t-primary animate-spin"></div>

            {/* Animated Text */}
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-700">Loading</span>
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-1 rounded-full bg-primary animate-bounce"></span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProxyView;
