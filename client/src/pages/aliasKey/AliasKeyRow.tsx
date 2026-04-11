import { useNavigate } from "react-router-dom";
import type { IAliasKey } from "../../../interface/aliasKey.interface";
import { FiArrowDownRight, FiArrowRight, FiEdit2 } from "react-icons/fi"; // Feather icons
import { FiTrash2 } from "react-icons/fi";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import apiClient from "../../services/apiClient";

interface AliasKeyRowProps {
  apiData: IAliasKey;
  handleDelete: (id: string) => void;
  userRole: string;
  onActionClick: (data: IAliasKey) => void;
  index: number;
  mobileView?: boolean;
}

function AliasKeyRow({
  apiData,
  handleDelete,
  userRole,
  onActionClick,
  index,
  mobileView = false,
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
      className={`grid ${
        userRole === "Admin"
          ? "grid grid-cols-[40px_1.2fr_1.5fr_2fr_1.5fr_100px_100px_100px_100px_100px]"
          : "grid grid-cols-[40px_2fr_1.5fr_100px_100px_100px_100px_100px]"
      } bg-gradient-to-r from-gray-50 to-gray-100 text-base font-semibold text-gray-600  px-4 py-3 border-b border-gray-200`}
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
            className="inline-flex items-center gap-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 hover:text-yellow-800 text-base px-3 py-1.5 rounded-lg transition-all duration-200"
            title="Click here to change status"
          >
            <Clock className="w-6 h-6" />
            {apiData.status || "-"}
          </button>
        ) : (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-base font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
            ></div>
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
          <span className="text-gray-700">
            {apiData.remaining_quota || "-"}
          </span>
          {apiData.total_quota && apiData.remaining_quota && (
            <span className="text-base text-gray-400">
              (
              {Math.round(
                (apiData.remaining_quota / apiData.total_quota) * 100,
              )}
              %)
            </span>
          )}
        </div>
        {/* Mini progress bar */}
        {apiData.total_quota && apiData.remaining_quota && (
          <div className="w-16 h-1 mt-1 overflow-hidden text-base bg-gray-200 rounded-full">
            <div
              className="h-1 transition-all duration-300 rounded-full bg-primary"
              style={{
                width: `${Math.min(
                  (apiData.remaining_quota / apiData.total_quota) * 100,
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
      <div className="flex justify-center gap-2">
        {userRole === "User" ? (
          <>
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-1 bg-primary/10 hover:bg-primary text-primary hover:text-white text-base px-3 py-1.5 rounded-lg transition-all duration-200"
              title="Edit"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
            </button>
            {apiData.status == "Pending" && (
              <button
                onClick={confirmDelete}
                className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-base px-3 py-1.5 rounded-lg transition-all duration-200"
                title="Delete"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {apiData.status == "Active" && (
              <button
                type="button"
                onClick={handleGetProxyResponse}
                className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-base px-3 py-1.5 rounded-lg transition-all duration-200"
              >
                <FiArrowRight></FiArrowRight>
              </button>
            )}
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default AliasKeyRow;
