import { useNavigate } from "react-router-dom";
import type { IProxy } from "../../interface/proxy.interface";
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

  // Desktop Table View
  return (
    <div
      className={`grid ${gridColsClass}  text-xs    px-4 py-3 border-b border-gray-200`}
    >
      <div className="font-medium">{index + 1}</div>
      <div className="text-xs text-gray-800 truncate ">
        {apiData.proxy_name || "-"}
      </div>
      <div className="text-xs truncate">{apiData.proxy_token || "-"}</div>
      <div className="text-xs  truncate">{apiData.curl || "-"}</div>
      <div className="text-xs  truncate">
        &nbsp;&nbsp;{apiData.credit || "0"}
      </div>
      {/* Status Badge */}

      <div className="text-xs ">
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
        >
          <FiEdit2 className="w-4 h-4" />
          <span className="absolute px-2 py-1 text-xs text-white transition-opacity -translate-x-1/2 bg-primary rounded opacity-0 pointer-events-none -top-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
            Edit
          </span>
        </button>

        <button
          onClick={confirmDelete}
          className="p-1.5 text-red-600 hover:text-white hover:bg-red-500 rounded-md transition-all duration-200 group relative"
        >
          <FiTrash2 className="w-4 h-4" />
          <span className="absolute px-2 py-1 text-xs text-white transition-opacity -translate-x-1/2 bg-primary rounded opacity-0 pointer-events-none -top-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
            Delete
          </span>
        </button>
        <button
          onClick={() => onActionClick(apiData)}
          className="p-1.5 rounded-md transition-all duration-200 group relative"
        >
          <FiEye className="w-4 h-4"></FiEye>
          <span className="absolute px-2 py-1 text-xs text-white transition-opacity -translate-x-1/2 bg-primary rounded opacity-0 pointer-events-none -top-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
            View
          </span>
        </button>
      </div>
    </div>
  );
}

export default ProxyRow;
