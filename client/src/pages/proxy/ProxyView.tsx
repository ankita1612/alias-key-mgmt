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

// Move these components OUTSIDE of ProxyView
const InfoRow = ({ label, value, icon, isLink = false, isFull = false }) => (
  <div
    className={`flex items-start gap-3 p-3 bg-white rounded-lg ${isFull ? "md:col-span-2 lg:col-span-3" : ""}`}
  >
    <span className="text-xl">{icon || "📄"}</span>
    <div className="flex-1">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-700 font-medium break-all text-sm"
        >
          {value}
        </a>
      ) : (
        <p className="text-gray-700 font-medium break-all text-sm">
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
      <div className="bg-white rounded-xl p-5 text-center">
        <p className="text-3xl font-bold text-gray-800">{value || 0}</p>
        <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide">
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
        className="text-indigo-600 hover:text-indigo-700 font-medium break-all text-sm"
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
            <div className="px-6 py-3 bg-slate-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h5 className="text-lg font-semibold text-gray-800">
                  Proxy Details
                </h5>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ProxyInfoRow
                  label="Project"
                  value={data?.proxy?.project_name}
                />
                <ProxyInfoRow label="Domain" value={data?.proxy?.domain_name} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ProxyInfoRow
                  label="Proxy Name"
                  value={data?.proxy?.proxy_name}
                />
                <ProxyInfoRow
                  label="Proxy Token"
                  value={data?.proxy?.proxy_token}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ProxyInfoRow
                  label="Curl Token"
                  value={data?.proxy?.curl_token}
                />
                <ProxyInfoRow label="Credit" value={data?.proxy?.credit} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ProxyInfoRow
                  label="Status"
                  value={data?.proxy?.is_deleted ? "Deleted" : "Active"}
                />
              </div>
              <div className="grid grid-cols-1 gap-5">
                <ProxyInfoRow label="Curl" value={data?.proxy?.curl} />
              </div>
            </div>
          </div>

          {/* PART 2: Key Details Section */}
          <div className="overflow-hidden bg-white shadow-sm rounded-xl">
            {/* Header */}
            <div className="px-6 py-3 bg-slate-50 border-b border-gray-100">
              <h5 className="text-lg font-semibold text-gray-800">
                Key Details
              </h5>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: KEY LIST (2 columns width) */}
                <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex flex-col min-h-0">
                  {/* Title */}
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-menuActive rounded-full"></div>
                      <h6 className="font-semibold text-gray-800 text-sm">
                        Key List
                      </h6>
                    </div>

                    <span className="text-xs text-gray-500">
                      {data?.aliasKeys?.length || 0} keys
                    </span>
                  </div>

                  {/* TABLE WITH SCROLL */}
                  <div className="overflow-y-auto max-h-[260px]">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                          <th className="p-3 text-left text-xs font-medium text-gray-600 ">
                            Key
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-600 ">
                            Status
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-600 ">
                            Approval Status
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100 bg-white">
                        {data?.aliasKeys?.length > 0 ? (
                          data.aliasKeys.map((item: any) => (
                            <tr
                              key={item._id}
                              className="hover:bg-gray-50 transition"
                            >
                              <td className="p-3 font-mono text-gray-700">
                                {item.alias_key}
                              </td>

                              <td className="p-3">
                                <StatusBadge status={item.key_status} />
                              </td>

                              <td className="p-3">
                                <StatusBadge status={item.approval_status} />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={3}
                              className="p-6 text-center text-sm text-gray-500"
                            >
                              No keys found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* RIGHT: STATISTICS */}
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h6 className="font-semibold text-gray-800 text-sm">
                      Statistics
                    </h6>
                  </div>

                  {/* Active Card */}
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Active</span>
                      <span className="text-xl font-bold text-emerald-600">
                        {data?.stats?.active || 0}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 text-center text-sm">
                      <div>
                        <p className="text-gray-500">Approved</p>
                        <p className="font-bold text-green-600">
                          {data?.stats?.active_approved || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Pending</p>
                        <p className="font-bold text-yellow-600">
                          {data?.stats?.active_pending || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Rejected</p>
                        <p className="font-bold text-red-600">
                          {data?.stats?.active_rejected || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Inactive Card */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        Inactive
                      </span>
                      <span className="text-xl font-bold text-gray-600">
                        {data?.stats?.inactive || 0}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 text-center text-sm">
                      <div>
                        <p className="text-gray-500">Approved</p>
                        <p className="font-bold text-gray-600">
                          {data?.stats?.inactive_approved || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Pending</p>
                        <p className="font-bold text-yellow-600">
                          {data?.stats?.inactive_pending || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Rejected</p>
                        <p className="font-bold text-red-600">
                          {data?.stats?.inactive_rejected || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
    </div>
  );
}

export default ProxyView;
