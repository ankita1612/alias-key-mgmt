import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

function ApiHistoryView() {
  const { apiHistoryId } = useParams(); // ✅ FIXED
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch API Detail
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

  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-primary">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 -ml-6 rounded-r-full bg-menuActive" />
          <h5 className="text-lg font-medium text-white/80">
            API History Detail
          </h5>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-white/10 rounded-md hover:bg-white/20 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !data ? (
          <p className="text-sm text-gray-500">No data found</p>
        ) : (
          <div className="space-y-4">
            {/* USER */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-xs text-gray-500 uppercase">User</span>
              <span className="text-sm text-gray-900">
                {data.user?.first_name || "-"} ({data.user?.email || "-"})
              </span>
            </div>

            {/* ALIAS KEY */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-xs text-gray-500 uppercase">Alias Key</span>
              <span className="font-mono text-sm text-gray-900 break-all">
                {data.alias?.alias_key || "-"}
              </span>
            </div>

            {/* PROXY */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-xs text-gray-500 uppercase">Proxy</span>
              <span className="text-sm text-gray-900">
                {data.proxy?.proxy_name || "-"}
              </span>
            </div>

            {/* METHOD */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-xs text-gray-500 uppercase">Method</span>
              <span className="text-sm">{data.method || "-"}</span>
            </div>

            {/* STATUS */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-xs text-gray-500 uppercase">Status</span>
              <span className="text-sm font-medium">
                {data.response_status || "-"}
              </span>
            </div>

            {/* RESPONSE MESSAGE */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-xs text-gray-500 uppercase">
                Response Message
              </span>
              <span className="text-sm">{data.response_msg || "-"}</span>
            </div>

            {/* RESPONSE CODE */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-xs text-gray-500 uppercase">
                Response Code
              </span>
              <span className="text-sm">{data.response_code || "-"}</span>
            </div>

            {/* EXECUTION TIME */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-xs text-gray-500 uppercase">
                Execution Time
              </span>
              <span className="text-sm">{data.execution_time || 0} ms</span>
            </div>

            {/* CREATED DATE */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-xs text-gray-500 uppercase">Created</span>
              <span className="text-sm">
                {data.createdAt
                  ? new Date(data.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </div>

            {/* CURL (if exists) */}
            {data.proxy?.curl && (
              <div className="pt-3">
                <p className="mb-2 text-xs text-gray-500 uppercase">
                  Curl Command
                </p>

                <pre className="p-3 font-mono text-xs text-gray-800 break-words whitespace-pre-wrap rounded-md bg-gray-50">
                  {data.proxy.curl}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ApiHistoryView;
