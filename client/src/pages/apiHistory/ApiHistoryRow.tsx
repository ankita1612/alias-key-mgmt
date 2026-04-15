import { useNavigate } from "react-router-dom";
import type { IAliasKey } from "../../interface/aliasKey.interface";
import { FiEye } from "react-icons/fi";
const capitalize = (text?: string) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : "-";
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
      case "success":
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
      case "fail":
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

  const statusConfig = getStatusConfig(apiData.response_status);

  // Desktop Table View
  return (
    <div
      className={`grid ${gridColsClass}  text-base font-semibold text-gray-600  px-4 py-3 border-b border-gray-200`}
    >
      {/* Index */}
      <div className="font-medium text-gray-400">{index + 1}</div>

      <div className="font-mono text-base text-gray-800 truncate">
        {apiData.alias.alias_key}
      </div>

      {/* Domain */}
      <div className="text-base text-gray-600 truncate">
        {apiData.method || "-"}
      </div>

      {/* Total Quota */}
      <div className="text-base font-semibold text-gray-800">
        {apiData.execution_time}ms
      </div>

      {/* Used Quota */}
      <div>
        <div className="flex items-center gap-2 text-base">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-base font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
          >
            {capitalize(apiData.response_status) || "-"}
          </span>
        </div>
        {/* Mini progress bar */}
      </div>
      <div className="text-base font-semibold text-gray-800">
        {apiData.response_msg}
      </div>
      <div className="text-base font-semibold text-gray-800">
        {apiData.response_code}
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
