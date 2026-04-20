import { useNavigate } from "react-router-dom";
import type { IAliasKey } from "../../../interface/aliasKey.interface";
import {
  FiArrowDownRight,
  FiArrowRight,
  FiEdit2,
  FiEye,
  FiList,
} from "react-icons/fi"; // Feather icons

import TotalHitsModal from "../aliasKey/TotalHitsModal";
import { useState } from "react";

interface KeyMonitorRowProps {
  apiData: IAliasKey;
  handleDelete: (id: string) => void;
  userRole: string;
  onActionClick: (data: IAliasKey) => void;
  makeActiveInactiveClick: (data: IAliasKey) => void;
  index: number;
  mobileView?: boolean;
  gridColsClass: string;
  showKeyDetail: (data: IAliasKey) => void;
  page: number; // ✅ add
  limit: number;
}

function KeyMonitorRow({
  apiData,
  handleDelete,
  userRole,
  onActionClick,
  makeActiveInactiveClick,
  index,
  mobileView = false,
  gridColsClass,
  showKeyDetail,
  page, // ✅ add
  limit,
}: KeyMonitorRowProps) {
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);

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

  const availablePercentage =
    apiData.total_quota > 0
      ? ((apiData.remaining_quota / apiData.total_quota) * 100).toFixed(2)
      : "0.00";
  const isDeleted = apiData.proxy?.is_deleted === true;

  // Desktop Table View
  return (
    <div
      className={`
      grid ${gridColsClass}  text-sm items-center    px-4 py-3 border-b border-gray-200 
      border-gray-200"}
    `}
    >
      {/* Index */}
      <div className=""> {(page - 1) * limit + index + 1}</div>

      <div className=" font-semibold truncate">{apiData.alias_key || "-"}</div>
      {/* Domain */}
      <div className=" break-words whitespace-normal">
        {apiData.domain_name || "-"}
      </div>

      {/* Status Badge */}
      <div className=" ">
        <>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1  font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
          >
            {apiData.status || "-"}
          </span>
        </>
      </div>

      {/* Total Quota */}
      <div className=" ">{apiData.total_quota || "-"}</div>

      {/* Used Quota */}
      <div>
        <div className="flex items-center gap-2 ">
          <span>
            {["Active", "Inactive"].includes(apiData.status)
              ? (apiData.remaining_quota ?? "-")
              : "-"}
          </span>
        </div>
        {/* Mini progress bar */}
      </div>
      <div className=" font-semibold ">
        {["Active", "Inactive"].includes(apiData.status) ? (
          <>
            {apiData.total_history_records > 0 ? (
              <button
                onClick={() => setShowStats(true)}
                className="  font-medium text-indigo-600 rounded-md bg-indigo-50 hover:bg-indigo-100"
              >
                {apiData.total_history_records}
              </button>
            ) : (
              "0"
            )}
          </>
        ) : (
          "-"
        )}
      </div>
      {/* Created Date */}
      <div className=" ">
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
        <button
          type="button"
          onClick={() => showKeyDetail(apiData)}
          className="p-1.5  rounded-md transition-all duration-200 group relative"
        >
          <FiEye className="w-4 h-4" />
          <span className="absolute px-2 py-1  text-white transition-opacity -translate-x-1/2 rounded opacity-0 pointer-events-none bg-primary -top-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
            View
          </span>
        </button>
        {["Active", "Inactive"].includes(apiData.status) && (
          <button
            onClick={() =>
              navigate(`/api-history/${apiData._id}`, {
                state: { aliasName: apiData.alias_key },
              })
            }
            className="p-1.5 text-purple-600 hover:text-white hover:bg-purple-500 rounded-md transition-all duration-200 group relative"
            title="View Requests"
          >
            <FiList className="w-4 h-4" />
            <span className="absolute px-2 py-1  text-white transition-opacity -translate-x-1/2 rounded opacity-0 pointer-events-none bg-primary -top-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
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

export default KeyMonitorRow;
