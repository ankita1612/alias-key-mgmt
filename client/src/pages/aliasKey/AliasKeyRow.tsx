import { useNavigate } from "react-router-dom";
import type { IAliasKey } from "../../../interface/aliasKey.interface";
import { FiArrowDownRight, FiArrowRight, FiEdit2 } from "react-icons/fi"; // Feather icons
import { FiTrash2 } from "react-icons/fi";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import apiClient from "../../services/apiClient";
import { History } from "lucide-react";

interface AliasKeyRowProps {
  apiData: IAliasKey;
  handleDelete: (id: string) => void;
  userRole: string;
  onActionClick: (data: IAliasKey) => void;
  index: number;
  mobileView?: boolean;
  gridColsClass: string;
}

function AliasKeyRow({
  apiData,
  handleDelete,
  userRole,
  onActionClick,
  index,
  mobileView = false,
  gridColsClass,
}: AliasKeyRowProps) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/alias-key/add/${apiData._id}`);
  };

  const confirmDelete = () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this record?",
    );
    if (confirm) handleDelete(apiData._id);
  };

  // Status badge configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Active":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          dot: "bg-green-500",
          border: "border-green-200",
        };
      case "Pending":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          dot: "bg-yellow-500",
          border: "border-yellow-200",
        };
      case "Rejected":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          dot: "bg-red-500",
          border: "border-red-200",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          dot: "bg-gray-500",
          border: "border-gray-200",
        };
    }
  };

  const statusConfig = getStatusConfig(apiData.status);
  const handleGetProxyResponse = async () => {
    try {
      if (apiData.alias_key == "") return;
      const result = await apiClient.get(
        `api/get-proxy-response?alias_key=${apiData.alias_key}`,
      );

      console.log("API Response:", result);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  // Desktop Table View
  return (
    <div
      className={`grid ${gridColsClass}  text-base font-semibold text-gray-600  px-4 py-3 border-b border-gray-200`}
    >
      {/* Index */}
      <div className="font-medium text-gray-400">{index + 1}</div>

      {/* Admin Fields */}
      {userRole === "Admin" && (
        <>
          <div className="text-base font-medium text-gray-800">
            {apiData?.user_id?.first_name || "-"}
          </div>
          <div className="text-base text-gray-600 truncate">
            {apiData?.user_id?.email || "-"}
          </div>
        </>
      )}

      {/* Alias Key */}
      <div className="font-mono text-base text-gray-800 truncate">
        {apiData.alias_key || "-"}
      </div>

      {/* Domain */}
      <div className="text-base text-gray-600 truncate">
        {apiData.domain || "-"}
      </div>

      {/* Status Badge */}
      <div className="text-base ">
        {apiData.status === "Pending" && userRole === "Admin" ? (
          <button
            onClick={() => onActionClick(apiData)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-base font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
            title="Click here to change status"
          >
            <Clock className="w-4 h-4" />
            {apiData.status || "-"}
          </button>
        ) : (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-base font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
          >
            {apiData.status || "-"}
          </span>
        )}
      </div>

      {/* Total Quota */}
      <div className="text-base font-semibold text-gray-800">
        {apiData.total_quota || "-"}
      </div>

      {/* Used Quota */}
      <div>
        <div className="flex items-center gap-2 text-base">
          <span className="text-gray-700">{apiData.used_quota || "-"}</span>
          {apiData.total_quota && apiData.used_quota && (
            <span className="text-base text-gray-400">
              ({Math.round((apiData.used_quota / apiData.total_quota) * 100)}%)
            </span>
          )}
        </div>
        {/* Mini progress bar */}
        {apiData.total_quota && apiData.used_quota && (
          <div className="w-16 h-1 mt-1 overflow-hidden text-base bg-gray-200 rounded-full">
            <div
              className="h-1 transition-all duration-300 rounded-full bg-primary"
              style={{
                width: `${Math.min(
                  (apiData.used_quota / apiData.total_quota) * 100,
                  100,
                )}%`,
              }}
            ></div>
          </div>
        )}
      </div>

      {/* Created Date */}
      <div className="text-base text-gray-500">
        {apiData.createdAt
          ? new Date(apiData.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-"}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 p-0.5">
        {userRole === "User" ? (
          <>
            <button
              onClick={handleEdit}
              className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-500 rounded-md transition-all duration-200 group relative"
              title="Edit"
            >
              <FiEdit2 className="w-4 h-4" />
              <span className="absolute px-2 py-1 text-xs text-white transition-opacity -translate-x-1/2 bg-gray-800 rounded opacity-0 pointer-events-none -top-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
                Edit
              </span>
            </button>

            {apiData.status === "Pending" && (
              <button
                onClick={confirmDelete}
                className="p-1.5 text-red-600 hover:text-white hover:bg-red-500 rounded-md transition-all duration-200 group relative"
                title="Delete"
              >
                <FiTrash2 className="w-4 h-4" />
                <span className="absolute px-2 py-1 text-xs text-white transition-opacity -translate-x-1/2 bg-gray-800 rounded opacity-0 pointer-events-none -top-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
                  Delete
                </span>
              </button>
            )}

            {apiData.status === "Active" && (
              <button
                type="button"
                onClick={handleGetProxyResponse}
                className="p-1.5 text-green-600 hover:text-white hover:bg-green-500 rounded-md transition-all duration-200 group relative"
                title="Test Proxy"
              >
                <FiArrowRight className="w-4 h-4" />
                <span className="absolute px-2 py-1 text-xs text-white transition-opacity -translate-x-1/2 bg-gray-800 rounded opacity-0 pointer-events-none -top-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
                  Test Proxy
                </span>
              </button>
            )}
          </>
        ) : null}

        {apiData.status === "Active" && (
          <button
            onClick={() => navigate(`/api-history/${apiData._id}`)}
            className="p-1.5 text-purple-600 hover:text-white hover:bg-purple-500 rounded-md transition-all duration-200 group relative"
            title="View Requests"
          >
            <History className="w-4 h-4" />
            <span className="absolute px-2 py-1 text-xs text-white transition-opacity -translate-x-1/2 bg-gray-800 rounded opacity-0 pointer-events-none -top-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
              History
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default AliasKeyRow;
