import { useNavigate } from "react-router-dom";
import type { IAliasKey } from "../../../interface/aliasKey.interface";
import { FiArrowDownRight, FiArrowRight, FiEdit2 } from "react-icons/fi"; // Feather icons
import { FiTrash2 } from "react-icons/fi";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import apiClient from "../../services/apiClient";
import { FiEye } from "react-icons/fi";
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
      const result = await apiClient.post(
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
        {apiData.user_alias_key_id.alias_key}
      </div>

      {/* Domain */}
      <div className="text-base text-gray-600 truncate">
        {JSON.stringify(apiData.request_info.method)}
      </div>

      {/* Total Quota */}
      <div className="text-base font-semibold text-gray-800">
        {apiData.execution_time}
      </div>

      {/* Used Quota */}
      <div>
        <div className="flex items-center gap-2 text-base">
          <span className="text-gray-700">{apiData.status}</span>
        </div>
        {/* Mini progress bar */}
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
        <>
          <button
            onClick={() => onActionClick(apiData)}
            className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white text-base px-2 py-1.5 rounded-lg transition-all duration-200"
            title="View"
          >
            <FiEye className="w-3.5 h-3.5" />
          </button>
        </>
      </div>
    </div>
  );
}

export default AliasKeyRow;
