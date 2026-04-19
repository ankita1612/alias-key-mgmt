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
      className={`grid ${gridColsClass}  text-xs    px-4 py-3 border-b border-gray-200`}
    >
      {/* Index */}
      <div className="font-medium">{index + 1}</div>

      <div className="font-mono text-xs text-gray-800 truncate">
        {apiData.alias.alias_key}
      </div>

      {/* Domain */}
      <div className="text-xs truncate">{apiData.method || "-"}</div>

      {/* Total Quota */}
      <div className="text-xs font-semibold">{apiData.execution_time}ms</div>

      {/* Used Quota */}
      <div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
          >
            {capitalize(apiData.response_status) || "-"}
          </span>
        </div>
        {/* Mini progress bar */}
      </div>
      <div className="text-xs font-semibold">{apiData.response_msg}</div>
      <div className="text-xs font-semibold">{apiData.response_code}</div>
      {/* Created Date */}
      <div className="text-xs">
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
            type="button"
            onClick={() => onActionClick(apiData)}
            className="p-1.5  rounded-md transition-all duration-200 group relative"
          >
            <FiEye className="w-4 h-4" />
            <span className="absolute px-2 py-1 text-xs text-white transition-opacity -translate-x-1/2 bg-primary rounded opacity-0 pointer-events-none -top-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
              View
            </span>
          </button>
        </>
      </div>
    </div>
  );
}

export default AliasKeyRow;
