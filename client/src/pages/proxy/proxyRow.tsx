import { useNavigate } from "react-router-dom";
import type { IProxy } from "../../interface/proxy.interface";
import {
  FiArrowDownRight,
  FiArrowRight,
  FiEdit2,
  FiList,
} from "react-icons/fi"; // Feather icons
import { FiTrash2 } from "react-icons/fi";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import apiClient from "../../services/apiClient";
import { History } from "lucide-react";
import { useState } from "react";

interface ProxyRowProps {
  apiData: IProxy;
  handleDelete: (id: string) => void;
  userRole: string;
  onActionClick: (data: IProxy) => void;
  makeActiveInactiveClick: (data: IProxy) => void;
  index: number;
  mobileView?: boolean;
  gridColsClass: string;
}

function ProxyRow({
  apiData,
  handleDelete,
  userRole,
  onActionClick,
  makeActiveInactiveClick,
  index,
  mobileView = false,
  gridColsClass,
}: ProxyRowProps) {
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);
  const handleEdit = () => {
    navigate(`/proxy/add/${apiData._id}`);
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

  // Desktop Table View
  return (
    <div
      className={`grid ${gridColsClass}  text-base font-semibold text-gray-600  px-4 py-3 border-b border-gray-200`}
    >
      <div className="font-medium text-gray-400">{index + 1}</div>
      <div className="font-mono text-base text-gray-800 truncate">
        {apiData.domain || "-"}
      </div>
      <div className="text-base text-gray-600 truncate">
        {apiData.project_name || "-"}
      </div>
      <div className="text-base text-gray-600 truncate">
        {apiData.curl || "-"}
      </div>
      <div className="text-base text-gray-600 truncate">
        {apiData.credit || "-"}
      </div>
      {/* Status Badge */}
      <div className="text-base ">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-base font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
        >
          {apiData.status || "-"}
        </span>
      </div>

      <div className="text-base text-gray-500">
        {" "}
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
          onClick={handleEdit}
          className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-500 rounded-md transition-all duration-200 group relative"
          title="Edit"
        >
          <FiEdit2 className="w-4 h-4" />
          <span className="absolute px-2 py-1 text-base text-white transition-opacity -translate-x-1/2 bg-gray-800 rounded opacity-0 pointer-events-none -top-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
            Edit
          </span>
        </button>

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
      </div>
    </div>
  );
}

export default ProxyRow;
