import { useNavigate } from "react-router-dom";
import type { IAliasKey } from "../../../interface/aliasKey.interface";
import {
  FiArrowDownRight,
  FiArrowRight,
  FiEdit2,
  FiEye,
  FiList,
} from "react-icons/fi"; // Feather icons
import { FiTrash2 } from "react-icons/fi";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import apiClient from "../../services/apiClient";
import { History } from "lucide-react";
import TotalHitsModal from "./TotalHitsModal";
import { useState } from "react";

interface AliasKeyRowProps {
  apiData: IAliasKey;
  handleDelete: (id: string) => void;
  userRole: string;
  onActionClick: (data: IAliasKey) => void;
  makeActiveInactiveClick: (data: IAliasKey) => void;
  index: number;
  mobileView?: boolean;
  gridColsClass: string;
  showKeyDetail: (data: IAliasKey) => void;
}

function AliasKeyRow({
  apiData,
  handleDelete,
  userRole,
  onActionClick,
  makeActiveInactiveClick,
  index,
  mobileView = false,
  gridColsClass,
  showKeyDetail,
}: AliasKeyRowProps) {
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);
  const handleEdit = () => {
    navigate(`/alias-key/add/${apiData._id}`);
  };

  const confirmDelete = () => {
    handleDelete(apiData._id);
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
      case "Inactive":
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          dot: "bg-gray-400",
          border: "border-gray-300",
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
  const availablePercentage =
    apiData.total_quota > 0
      ? ((apiData.remaining_quota / apiData.total_quota) * 100).toFixed(2)
      : "0.00";
  const isDeleted = apiData.proxy?.is_deleted === true;

  // Desktop Table View
  return (
    <div
      className={`
      grid ${gridColsClass} text-base font-semibold text-gray-600 px-4 py-3 border-b 
      ${isDeleted ? "bg-red-50 opacity-75 " : "border-gray-200"}
    `}
    >
      {/* Index */}
      <div className="font-medium text-gray-400">{index + 1}</div>

      {/* Admin Fields */}
      {userRole === "Admin" && (
        <>
          <div className="text-base font-medium text-gray-800">
            {apiData?.user?.first_name || "-"}
          </div>
          <div className="text-base text-gray-600 truncate">
            {apiData?.user?.email || "-"}
          </div>
        </>
      )}

      <div className="font-mono text-base text-gray-800 truncate">
        {apiData.alias_key || "-"}
      </div>

      {/* Domain */}
      <div className="text-base text-gray-600 truncate">
        {apiData.domain_name || "-"}
      </div>

      {/* Status Badge */}
      <div className="text-base ">
        {userRole === "Admin" ? (
          <>
            {apiData.status === "Pending" ? (
              <button
                disabled={isDeleted}
                onClick={() => onActionClick(apiData)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-base font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
                title="Click here to change status"
              >
                <Clock className="w-4 h-4" />
                {apiData.status || "-"}
              </button>
            ) : apiData.status === "Active" ? (
              <button
                disabled={isDeleted}
                onClick={() => makeActiveInactiveClick(apiData, "Inactive")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-base font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
                title="Click here to change status"
              >
                <CheckCircle className="w-4 h-4" />
                {apiData.status || "-"}
              </button>
            ) : apiData.status === "Inactive" ? (
              <button
                disabled={isDeleted}
                onClick={() => makeActiveInactiveClick(apiData, "Active")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-base font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
                title="Click here to change status"
              >
                <XCircle className="w-4 h-4" />
                {apiData.status || "-"}
              </button>
            ) : (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-base font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
              >
                {apiData.status || "-"}
              </span>
            )}
          </>
        ) : (
          <>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-base font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
            >
              {apiData.status || "-"}
            </span>
          </>
        )}
      </div>

      {/* Total Quota */}
      <div className="text-base font-semibold text-gray-800">
        {apiData.total_quota || "-"}
      </div>

      {/* Used Quota */}
      <div>
        <div className="flex items-center gap-2 text-base">
          <span className="text-gray-700">
            {["Active", "Inactive"].includes(apiData.status)
              ? (apiData.remaining_quota ?? "-")
              : "-"}
          </span>

          {["Active", "Inactive"].includes(apiData.status) &&
            apiData.total_quota != null &&
            apiData.remaining_quota != null && (
              <span className="text-base text-gray-400">
                ({availablePercentage}%)
              </span>
            )}
        </div>
        {/* Mini progress bar */}
      </div>
      <div className="text-base font-semibold text-gray-800">
        {["Active", "Inactive"].includes(apiData.status) ? (
          <button
            onClick={() => setShowStats(true)}
            className="px-2 py-1 text-base font-medium text-indigo-600 rounded-md bg-indigo-50 hover:bg-indigo-100"
          >
            {apiData.total_history_records}
          </button>
        ) : (
          "-"
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
              disabled={isDeleted}
              onClick={handleEdit}
              className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-500 rounded-md transition-all duration-200 group relative"
              title="Edit"
            >
              <FiEdit2 className="w-4 h-4" />
              <span className="absolute px-2 py-1 text-base text-white transition-opacity -translate-x-1/2 bg-gray-800 rounded opacity-0 pointer-events-none -top-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
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
                <span className="absolute px-2 py-1 text-base text-white transition-opacity -translate-x-1/2 bg-gray-800 rounded opacity-0 pointer-events-none -top-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
                  Delete
                </span>
              </button>
            )}

            {apiData.status === "Active" && (
              <>
                <button
                  type="button"
                  onClick={handleGetProxyResponse}
                  className="p-1.5 text-green-600 hover:text-white hover:bg-green-500 rounded-md transition-all duration-200 group relative"
                  title="Test Proxy"
                >
                  <FiArrowRight className="w-4 h-4" />
                  <span className="absolute px-2 py-1 text-base text-white transition-opacity -translate-x-1/2 bg-gray-800 rounded opacity-0 pointer-events-none -top-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
                    Test Proxy
                  </span>
                </button>
              </>
            )}
          </>
        ) : null}
        <button
          type="button"
          onClick={() => showKeyDetail(apiData)}
          className="p-1.5  rounded-md transition-all duration-200 group relative"
          title="View Details"
        >
          <FiEye className="w-4 h-4" />
          <span className="absolute px-2 py-1 text-base text-white transition-opacity -translate-x-1/2 bg-gray-800 rounded opacity-0 pointer-events-none -top-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
            View Details
          </span>
        </button>
        {["Active", "Inactive"].includes(apiData.status) && (
          <button
            onClick={() => navigate(`/api-history/${apiData._id}`)}
            className="p-1.5 text-purple-600 hover:text-white hover:bg-purple-500 rounded-md transition-all duration-200 group relative"
            title="View Requests"
          >
            <FiList className="w-4 h-4" />
            <span className="absolute px-2 py-1 text-base text-white transition-opacity -translate-x-1/2 bg-gray-800 rounded opacity-0 pointer-events-none -top-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
              History
            </span>
          </button>
        )}
      </div>
      {showStats && (
        <TotalHitsModal data={apiData} onClose={() => setShowStats(false)} />
      )}
    </div>
  );
}

export default AliasKeyRow;
