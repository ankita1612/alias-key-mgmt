import {
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  PauseCircle,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StatusBadgeProps = {
  status?: string;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

export default StatusBadge;

type StatusConfig = {
  bg: string;
  text: string;
  border: string;
  icon: LucideIcon;
  label: string;
};

export const getStatusConfig = (status?: string): StatusConfig => {
  const statusLower = status?.toLowerCase() || "";

  const statusMap: Record<string, StatusConfig> = {
    approved: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      icon: CheckCircle,
      label: "Approved",
    },
    fail: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: XCircle,
      label: "Fail",
    },
    rejected: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: XCircle,
      label: "Rejected",
    },
    pending: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      icon: Clock,
      label: "Pending",
    },
    active: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: PlayCircle,
      label: "Active",
    },
    inactive: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-300",
      icon: PauseCircle,
      label: "Inactive",
    },
    deleted: {
      bg: "bg-gray-50",
      text: "text-gray-500",
      border: "border-gray-200",
      icon: Trash2,
      label: "Deleted",
    },
    success: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: CheckCircle, // or Check
      label: "Success",
    },
  };

  return (
    statusMap[statusLower] || {
      bg: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-200",
      icon: Clock,
      label: status || "-",
    }
  );
};
