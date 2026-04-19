import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Key,
  Globe,
  AlertCircle,
  Zap,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";

function ApiHistoryView() {
  const { apiHistoryId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(
          `/api/api-history/get-detail/${apiHistoryId}`,
        );
        setData(res.data?.data);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (apiHistoryId) fetchDetails();
  }, [apiHistoryId]);

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "success" || statusLower === "active")
      return { color: "bg-green-100 text-green-800", icon: CheckCircle };
    if (statusLower === "fail" || statusLower === "inactive")
      return { color: "bg-red-100 text-red-800", icon: XCircle };
    return { color: "bg-yellow-100 text-yellow-800", icon: Clock };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      //  hour: "2-digit",
      // minute: "2-digit",
    });
  };

  const InfoRow = ({
    label,
    value,
    isCode = false,
    type = "",
  }: {
    label: string;
    value: any;
    isCode?: boolean;
  }) => (
    <div className="py-1 ">
      <label className="block text-xs font-medium uppercase mb-1.5">
        {label}
      </label>
      {isCode ? (
        <pre className="p-2 font-mono text-xs text-gray-500 break-words whitespace-pre-wrap rounded-lg">
          {value || "-"}
        </pre>
      ) : type === "status" ? (
        <StatusBadge status={value}></StatusBadge>
      ) : (
        <p className="text-sm text-gray-500">{value || "-"}</p>
      )}
    </div>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const { color, icon: Icon } = getStatusBadge(status);
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${color}`}
      >
        <Icon className="w-3 h-3" />
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "-"}
      </span>
    );
  };

  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-md shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-primary">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* Accent line touching left border */}
          <div className="w-1 h-6 -ml-6 rounded-r-full bg-menuActive" />

          {/* Title */}
          <div>
            <h5 className=" sm:text-xl text-white/60">Key Monitor</h5>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin"></div>
            <p className="mt-4">Loading details...</p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && !data && (
        <div className="flex items-center justify-center mx-6 mt-6 bg-white h-96 rounded-xl">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No data found</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && data && (
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* LEFT COLUMN - API REQUEST */}
            <div className="overflow-hidden bg-white shadow-sm rounded-xl">
              {/* Card Header - No Border, Just Background */}
              <div className="px-6 py-4 bg-slate-50">
                <div className="flex items-center gap-2">
                  <h6 className="font-semibold ">API Request</h6>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-5 pb-4 ">
                  <InfoRow label="Method" value={data.method} />
                  <InfoRow
                    label="Response Status"
                    type="status"
                    value={data.response_status}
                  />
                </div>

                <div className="grid grid-cols-2 gap-5 pb-4 ">
                  <InfoRow label="Response Code" value={data.response_code} />

                  <div>
                    <InfoRow
                      label="Execution Time"
                      value={data.execution_time + "ms" || 0 + "ms"}
                    />
                  </div>
                </div>

                <InfoRow label="Response" value={data.response_msg} />

                {data.request_params &&
                  Object.keys(data.request_params).length > 0 && (
                    <InfoRow
                      label="Request Parameters"
                      value={JSON.stringify(
                        Object.fromEntries(
                          Object.entries(data.request_params).filter(
                            ([key]) => key !== "alias_key",
                          ),
                        ),
                        null,
                        2,
                      )}
                      isCode
                    />
                  )}

                <InfoRow
                  label="Created At"
                  value={formatDate(data.createdAt)}
                />
              </div>
            </div>

            {/* RIGHT COLUMN - Alias Key + Proxy */}
            <div className="flex flex-col gap-6">
              {/* Alias Key Card */}
              <div className="overflow-hidden bg-white shadow-sm rounded-xl">
                <div className="px-6 py-4 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">Alias Key</h2>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <InfoRow label="Alias Key" value={data.alias?.alias_key} />
                  <div>
                    <label className="block text-xs font-medium uppercase mb-1.5">
                      Status
                    </label>
                    <StatusBadge status={data.alias?.status} />
                  </div>
                  <InfoRow
                    label="Project Name"
                    value={data.alias?.project_name}
                  />
                  <InfoRow
                    label="Domain Name"
                    value={data.alias?.domain_name}
                  />
                </div>
              </div>

              {/* Proxy Card */}
              <div className="overflow-hidden bg-white shadow-sm rounded-xl">
                <div className="px-6 py-4 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h6 className="font-semibold ">Proxy</h6>
                    </div>
                    {data.proxy?.is_deleted && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        Deleted
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {data.proxy?.is_deleted && (
                    <div className="p-3 text-sm text-red-700 border-l-4 border-red-500 rounded-lg bg-red-50">
                      This proxy has been deleted and is no longer available
                    </div>
                  )}

                  <InfoRow label="Proxy Name" value={data.proxy?.proxy_name} />

                  <InfoRow
                    label="cURL Command"
                    value={data.proxy?.curl}
                    isCode
                  />

                  {data.proxy?.description && (
                    <InfoRow
                      label="Description"
                      value={data.proxy?.description}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Back Button - Clean and Simple */}
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
      )}
    </div>
  );
}

export default ApiHistoryView;
