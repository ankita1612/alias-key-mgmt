import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Database } from "lucide-react";

import apiClient from "../services/apiClient";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Key,
  XCircle,
  AlertTriangle,
  ServerCrash,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  Activity,
  Gauge,
  AlertCircle,
  Zap,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  User,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  Plus,
} from "lucide-react";

const COLORS = {
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  neutral: "#6b7280",
  active: "#059669",
  pending: "#d97706",
  inactive: "#6b7280",
  rejected: "#dc2626",
  primary: "#6366f1",
  secondary: "#8b5cf6",
};

interface DashboardData {
  totalAliasKeys: number;
  activeAliasKeys: number;
  inactiveAliasKeys: number;
  approvedAliasKeys: number;
  pendingAliasKeys: number;
  rejectedAliasKeys: number;
  totalAliasRequestsCurrentMonth: number;
  lastRequestMinutesAgo: number | null;
  lastRequestAt: string | null;
  totalRequests: number;
  totalRequestsAllTime: number;
  aliasStatusCounts?: {
    approvalStatus: {
      Approved: number;
      Pending: number;
      Rejected: number;
    };
    keyStatus: {
      Active: number;
      Inactive: number;
    };
    breakdown?: {
      Active: { Approved: number; Pending: number; Rejected: number };
      Inactive: { Approved: number; Pending: number; Rejected: number };
    };
  };
  responseOverviewTotal: number;
  apiStatusCounts: {
    SUCCESS: number;
    LIMIT_EXCEED: number;
    INTERNAL_SERVER: number;
    KEY_NOT_ACTIVE: number;
    EXTERNAL_ERROR: number;
    INVALID_PROXY: number;
    PARAM_MISSING: number;
  };
  quota: {
    totalQuota: number;
    usedQuota: number;
    remainingQuota: number;
    usedPercent: number;
  };
  requestsLast7Days: Array<{ date: string; count: number }>;
}

function UserDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [timeFilter, setTimeFilter] = useState<string>("today");

  const filterLabels: Record<string, string> = {
    today: "Today",
    week: "This Week",
    month: "This Month",
    all: "All Time",
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<DashboardData>(
        `/api/dashboard?timeFilter=${timeFilter}`,
      );
      if (response.data) {
        setDashboard(response.data);
        setLastUpdated(new Date());
      }
    } catch (caughtError) {
      const error = caughtError as unknown as {
        name?: string;
        message?: string;
        response?: { data?: { message?: string } };
      };
      if (error.name !== "CanceledError") {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to load dashboard data",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "primary",
    valueColor = "text-gray-900",
  }: any) => {
    const gradientColors = {
      primary: "from-indigo-500 to-purple-600",
      success: "from-emerald-500 to-teal-600",
      warning: "from-amber-500 to-orange-600",
      info: "from-blue-500 to-cyan-600",
    };

    const borderColors = {
      primary: "#6366f120",
      success: "#10b98120",
      warning: "#f59e0b20",
      info: "#3b82f620",
    };

    return (
      <div
        className="flex items-center gap-3 px-4 py-4 transition bg-white border rounded-lg shadow-sm hover:shadow-md"
        style={{
          borderColor: borderColors[color],
          borderLeft: `3px solid ${borderColors[color].replace("20", "60")}`,
        }}
      >
        {/* Icon */}
        {Icon && (
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br ${
              gradientColors[color]
            }`}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          <div className="flex flex-col">
            {/* VALUE (top, bold) */}
            <p className={`text-lg font-semibold ${valueColor}`}>{value}</p>

            {/* TITLE (bottom, subtle) */}
            <p className="text-xs font-medium text-slate-500">{title}</p>
          </div>
        </div>
      </div>
    );
  };

  const StatusCard = ({ label, value, color, icon: Icon, percentage }: any) => (
    <div className="flex items-center justify-between p-3 transition-all duration-200 rounded-lg group hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <div
          className={`rounded-lg p-2 ${
            color === COLORS.success
              ? "bg-emerald-100"
              : color === COLORS.warning
                ? "bg-amber-100"
                : color === COLORS.error
                  ? "bg-red-100"
                  : "bg-gray-100"
          }`}
        >
          <Icon
            className={`h-4 w-4 ${
              color === COLORS.success
                ? "text-emerald-600"
                : color === COLORS.warning
                  ? "text-amber-600"
                  : color === COLORS.error
                    ? "text-red-600"
                    : "text-gray-600"
            }`}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="text-xs text-gray-500">
            {percentage.toFixed(1)}% of total
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold text-gray-900">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Requests:{" "}
            <span className="font-semibold text-blue-600">
              {payload[0].value}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const safeQuota = dashboard?.quota || {
    totalQuota: 0,
    usedQuota: 0,
    remainingQuota: 0,
    usedPercent: 0,
  };

  const safeApiStatusCounts = dashboard?.apiStatusCounts || {
    SUCCESS: 0,
    LIMIT_EXCEED: 0,
    INTERNAL_SERVER: 0,
    KEY_NOT_ACTIVE: 0,
    EXTERNAL_ERROR: 0,
    INVALID_PROXY: 0,
    PARAM_MISSING: 0,
  };

  const safeAliasStatusCounts = dashboard?.aliasStatusCounts || {
    approvalStatus: { Approved: 0, Pending: 0, Rejected: 0 },
    keyStatus: { Active: 0, Inactive: 0 },
    breakdown: {
      Active: { Approved: 0, Pending: 0, Rejected: 0 },
      Inactive: { Approved: 0, Pending: 0, Rejected: 0 },
    },
  };

  const TimeFilterDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);

    const options = [
      { value: "today", label: "Today" },
      { value: "week", label: "This Week" },
      { value: "month", label: "This Month" },
      { value: "all", label: "All Time" },
    ];

    const selectedOption = options.find(
      (option) => option.value === timeFilter,
    );

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          isOpen &&
          !(event.target as Element).closest(".time-filter-dropdown")
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
      <div className="relative time-filter-dropdown">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <Filter className="w-4 h-4" />
          {selectedOption?.label}
          <ChevronDown className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute right-0 z-10 w-40 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTimeFilter(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 focus:outline-none ${
                  timeFilter === option.value
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 mb-3 text-gray-400" />
        <p className="text-lg font-medium text-gray-700">
          Unable to load dashboard
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Please try refreshing the page
        </p>
        <button
          onClick={() => fetchData()}
          className="px-4 py-2 mt-4 text-sm font-medium text-white rounded-lg bg-primary hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div>
                  <h5 className="font-bold sm:text-xl">
                    Key management Overview
                  </h5>
                  {/* <p className="mt-1 text-xs text-slate-500">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p> */}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {/* <div className="flex items-center gap-2 mt-4 lg:mt-0">
              <button
                onClick={() => fetchData()}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => navigate("/alias-key/request")}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Request New Key
              </button>
            </div> */}
          </div>
        </div>

        {dashboard && (
          <>
            {/* Quota Usage Progress - Prominent Display */}
            {/* <div className="p-5 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-gray-800">
                    Quota Usage
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {safeQuota.usedQuota.toLocaleString()} /{" "}
                  {safeQuota.totalQuota.toLocaleString()} requests
                </span>
              </div>
              <div className="w-full h-4 overflow-hidden bg-gray-100 rounded-full">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    safeQuota.usedPercent >= 90
                      ? "bg-red-500"
                      : safeQuota.usedPercent >= 70
                        ? "bg-amber-500"
                        : "bg-primary"
                  }`}
                  style={{
                    width: `${Math.min(safeQuota.usedPercent, 100)}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`text-sm font-medium ${
                    safeQuota.usedPercent >= 90
                      ? "text-red-600"
                      : safeQuota.usedPercent >= 70
                        ? "text-amber-600"
                        : "text-gray-600"
                  }`}
                >
                  {safeQuota.usedPercent.toFixed(1)}% used
                </span>
                <span className="text-sm text-gray-500">
                  {safeQuota.remainingQuota.toLocaleString()} remaining
                </span>
              </div>
              {safeQuota.usedPercent >= 80 && (
                <div className="p-2 mt-3 border rounded-md bg-amber-50 border-amber-200">
                  <p className="flex items-center gap-1 text-xs text-amber-700">
                    <AlertTriangle className="w-3 h-3" />
                    You have used {safeQuota.usedPercent.toFixed(1)}% of your
                    quota. Consider requesting more quota if needed.
                  </p>
                </div>
              )}
            </div> */}

            {/* Pending Requests Alert */}
            {/* {dashboard.pendingAliasKeys > 0 && (
              <div className="flex items-center gap-4 p-4 mb-6 border-l-4 border-blue-500 rounded-md shadow-sm bg-blue-50">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900">
                    {dashboard.pendingAliasKeys} Request
                    {dashboard.pendingAliasKeys > 1 ? "s" : ""} Pending Approval
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Your key requests are being reviewed by administrators.
                    You'll be notified once approved.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/alias-key?approvalStatus=Pending")}
                  className="flex-shrink-0 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 whitespace-nowrap"
                >
                  View
                </button>
              </div>
            )} */}

            {/* Rejected Keys Alert */}
            {/* {dashboard.rejectedAliasKeys > 0 && (
              <div className="flex items-center gap-4 p-4 mb-6 border-l-4 border-red-500 rounded-md shadow-sm bg-red-50">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-red-100 rounded-full">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900">
                    {dashboard.rejectedAliasKeys} Request
                    {dashboard.rejectedAliasKeys > 1 ? "s" : ""} Rejected
                  </p>
                  <p className="text-xs text-red-700 mt-0.5">
                    Review the rejection reasons and resubmit your requests if
                    needed.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/alias-key?approvalStatus=Rejected")}
                  className="flex-shrink-0 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 whitespace-nowrap"
                >
                  Review
                </button>
              </div>
            )} */}

            {/* Last Request Info */}
            {/* {dashboard.lastRequestAt && (
              <div className="flex items-center gap-3 p-4 mb-6 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    Last API Request
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(dashboard.lastRequestAt).toLocaleString()}
                    {dashboard.lastRequestMinutesAgo !== null && (
                      <span className="ml-2">
                        ({dashboard.lastRequestMinutesAgo} minutes ago)
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/api-history")}
                  className="text-sm text-primary hover:underline"
                >
                  View History
                </button>
              </div>
            )} */}

            {/* Key Metrics Grid */}
            <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total Keys"
                value={dashboard.totalAliasKeys.toLocaleString()}
                icon={Key}
                color="primary"
              />

              <StatCard
                title="Active Keys"
                value={dashboard.activeAliasKeys.toLocaleString()}
                icon={CheckCircle}
                color="success"
              />

              <StatCard
                title="Pending Approval"
                value={dashboard.pendingAliasKeys.toLocaleString()}
                icon={Clock}
                color="warning"
              />

              {/* <StatCard
                title="Total Requests"
                value={dashboard.totalRequestsAllTime.toLocaleString()}
                icon={Activity}
                color="info"
              /> */}
            </div>

            {/* Quick Status Cards */}

            {/* Key Status Summary */}
            <div className="grid gap-6 mb-6 lg:grid-cols-3">
              {/* Quota Summary Card - Enhanced */}
              <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                <div className="px-5 py-4 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                      <Gauge className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Quota Summary
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  {/* Progress Circle Visualization */}

                  {/* Stats */}
                  <div className="space-y-3">
                    {/* Total */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm text-gray-600">
                          Total Quota
                        </span>
                      </div>
                      <span className="text-base font-semibold text-gray-900">
                        {safeQuota.totalQuota.toLocaleString()}
                      </span>
                    </div>

                    {/* Used */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-gray-600">Used</span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-semibold text-amber-600">
                          {safeQuota.usedQuota.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Remaining */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-gray-600">Remaining</span>
                      </div>
                      <span className="text-base font-semibold text-emerald-600">
                        {safeQuota.remainingQuota.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Warning Alert */}
                </div>
              </div>

              {/* Active Keys Card - Enhanced */}
              <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                <div className="px-5 py-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 shadow-sm bg-emerald-500 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wider uppercase text-emerald-600">
                          Status
                        </p>
                        <h3 className="text-lg font-bold text-gray-800">
                          Active Keys
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">
                        {safeAliasStatusCounts.keyStatus.Active.toLocaleString()}
                      </p>
                      <p className="text-xs text-emerald-500">Total Active</p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-4">
                    {[
                      {
                        label: "Approved",
                        value:
                          safeAliasStatusCounts.breakdown?.Active?.Approved ||
                          0,
                        color: "emerald",
                        icon: ThumbsUp,
                        bgColor: "bg-emerald-100",
                        textColor: "text-emerald-700",
                      },
                      {
                        label: "Pending",
                        value:
                          safeAliasStatusCounts.breakdown?.Active?.Pending || 0,
                        color: "amber",
                        icon: Clock,
                        bgColor: "bg-amber-100",
                        textColor: "text-amber-700",
                      },
                      {
                        label: "Rejected",
                        value:
                          safeAliasStatusCounts.breakdown?.Active?.Rejected ||
                          0,
                        color: "red",
                        icon: ThumbsDown,
                        bgColor: "bg-red-100",
                        textColor: "text-red-700",
                      },
                    ].map((item) => {
                      const total = safeAliasStatusCounts.keyStatus.Active || 1;
                      const percentage = (item.value / total) * 100;

                      return (
                        <div key={item.label} className="group">
                          <div className="flex items-center justify-between ">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`p-1.5 rounded-lg ${item.bgColor}`}
                              >
                                <item.icon
                                  className={`w-3.5 h-3.5 ${item.textColor}`}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {item.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900">
                                {item.value.toLocaleString()}
                              </span>
                              {/* <span className="text-xs text-gray-400">
                                ({percentage.toFixed(1)}%)
                              </span> */}
                            </div>
                          </div>
                          {/*<div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                            { <div
                              className={`h-full rounded-full transition-all duration-500 ease-out bg-${item.color}-500 group-hover:bg-${item.color}-600`}
                              style={{ width: `${percentage}%` }}
                            /> 
                          </div>*/}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Inactive Keys Card - Enhanced */}
              <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-500 shadow-sm rounded-xl">
                        <MinusCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                          Status
                        </p>
                        <h3 className="text-lg font-bold text-gray-800">
                          Inactive Keys
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-600">
                        {safeAliasStatusCounts.keyStatus.Inactive.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">Total Inactive</p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-4">
                    {[
                      {
                        label: "Approved",
                        value:
                          safeAliasStatusCounts.breakdown?.Inactive?.Approved ||
                          0,
                        color: "emerald",
                        icon: ThumbsUp,
                        bgColor: "bg-emerald-100",
                        textColor: "text-emerald-700",
                      },
                      {
                        label: "Pending",
                        value:
                          safeAliasStatusCounts.breakdown?.Inactive?.Pending ||
                          0,
                        color: "amber",
                        icon: Clock,
                        bgColor: "bg-amber-100",
                        textColor: "text-amber-700",
                      },
                      {
                        label: "Rejected",
                        value:
                          safeAliasStatusCounts.breakdown?.Inactive?.Rejected ||
                          0,
                        color: "red",
                        icon: ThumbsDown,
                        bgColor: "bg-red-100",
                        textColor: "text-red-700",
                      },
                    ].map((item) => {
                      const total =
                        safeAliasStatusCounts.keyStatus.Inactive || 1;
                      const percentage = (item.value / total) * 100;

                      return (
                        <div key={item.label} className="group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`p-1.5 rounded-lg ${item.bgColor}`}
                              >
                                <item.icon
                                  className={`w-3.5 h-3.5 ${item.textColor}`}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {item.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900">
                                {item.value.toLocaleString()}
                              </span>
                              {/* <span className="text-xs text-gray-400">
                                ({percentage.toFixed(1)}%)
                              </span> */}
                            </div>
                          </div>
                          {/* <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ease-out bg-${item.color}-500 group-hover:bg-${item.color}-600`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div> */}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* API Response Summary */}
            {/* <div className="grid gap-4 mb-6 lg:grid-cols-3">
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="mb-3 text-sm font-medium text-gray-700">
                  API Response Summary
                </p>
                <div className="space-y-2">
                  {[
                    {
                      label: "Success",
                      value: safeApiStatusCounts?.SUCCESS,
                      color: "text-emerald-600",
                    },
                    {
                      label: "Limit Exceeded",
                      value: safeApiStatusCounts?.LIMIT_EXCEED,
                      color: "text-amber-600",
                    },
                    {
                      label: "Key Not Active",
                      value: safeApiStatusCounts?.KEY_NOT_ACTIVE,
                      color: "text-gray-600",
                    },
                    {
                      label: "Errors",
                      value:
                        (safeApiStatusCounts?.EXTERNAL_ERROR || 0) +
                        (safeApiStatusCounts?.INTERNAL_SERVER || 0),
                      color: "text-red-600",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-gray-500">
                        {item.label}
                      </span>
                      <span className={`text-xs font-semibold ${item.color}`}>
                        {(item.value || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div> */}

            {/* Charts Section */}

            <div className="grid gap-5 mb-6 lg:grid-cols-2">
              <div className="overflow-hidden duration-300 bg-white border border-gray-100 rounded-md shadow-sm hover:shadow-lg">
                <div className="">
                  <div className="flex items-center justify-between px-6 py-2 bg-primary">
                    {/* LEFT */}
                    <div className="flex items-center gap-3">
                      {/* Accent line touching left border */}
                      <div className="w-1 h-6 -ml-6 rounded-r-full bg-menuActive" />

                      {/* Title */}
                      <div>
                        <h6 className=" text-white/60">Response Overview</h6>
                        <p className="mt-1 text-xs text-indigo-100/80">
                          Showing{" "}
                          {(
                            dashboard?.responseOverviewTotal ??
                            Object.values(dashboard.apiStatusCounts).reduce(
                              (a, b) => a + b,
                              0,
                            ) ??
                            0
                          ).toLocaleString()}{" "}
                          requests for {filterLabels[timeFilter]}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT - Time Filter */}
                    <TimeFilterDropdown />
                  </div>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    {[
                      {
                        label: "Success",
                        value: dashboard?.apiStatusCounts?.SUCCESS,
                        color: COLORS.success,
                        icon: CheckCircle,
                      },
                      {
                        label: "Inctive Keys",
                        value: dashboard?.apiStatusCounts?.KEY_NOT_ACTIVE,
                        color: COLORS.neutral,
                        icon: Key,
                      },
                      {
                        label: "Limit Exceeded",
                        value: dashboard?.apiStatusCounts?.LIMIT_EXCEED,
                        color: COLORS.warning,
                        icon: Zap,
                      },
                      {
                        label: "Proxy Key Deleted ",
                        value: dashboard?.apiStatusCounts?.INVALID_PROXY,
                        color: COLORS.pending,
                        icon: XCircle,
                      },
                      {
                        label: "Missing Request Params ",
                        value: dashboard?.apiStatusCounts?.PARAM_MISSING,
                        color: COLORS.secondary,
                        icon: AlertTriangle,
                      },
                      {
                        label: "API call error",
                        value:
                          dashboard?.apiStatusCounts?.EXTERNAL_ERROR +
                          dashboard?.apiStatusCounts?.INTERNAL_SERVER,
                        color: COLORS.error,
                        icon: ServerCrash,
                      },
                      {
                        label: "Internal Server Error",
                        value: dashboard?.apiStatusCounts?.INTERNAL_SERVER,
                        color: COLORS.error,
                        icon: AlertCircle,
                      },
                    ].map((status) => {
                      const total =
                        (dashboard?.responseOverviewTotal ??
                          dashboard?.totalRequests) ||
                        0;
                      const value = status?.value || 0;

                      // ✅ Safe percentage
                      const percentage = total > 0 ? (value / total) * 100 : 0;

                      // ✅ Better display with appropriate precision
                      const formattedPercentage =
                        percentage === 0
                          ? "0%"
                          : percentage < 0.01
                            ? "< 0.01%"
                            : percentage < 1
                              ? `${percentage.toFixed(2)}%`
                              : `${percentage.toFixed(1)}%`;

                      // ✅ Ensure bar is visible
                      const progressWidth =
                        percentage > 0 && percentage < 1 ? 1 : percentage;

                      return (
                        <div key={status.label} className="space-y-2">
                          {/* Top Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <status.icon className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">
                                {status.label}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {(value || 0).toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formattedPercentage}
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                            <div
                              className="h-full transition-all duration-700 rounded-full"
                              style={{
                                width: `${progressWidth}%`,
                                minWidth: percentage > 0 ? "4px" : "0px", // 👈 ensures visibility
                                backgroundColor: status.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* Request Activity Chart */}
              <div className="overflow-hidden duration-300 bg-white border border-gray-100 shadow-sm hover:shadow-md rounded-xl">
                <div>
                  <div className="flex items-center justify-between px-6 py-4 bg-primary">
                    <div className="flex items-center gap-3">
                      {/* Accent line touching left border */}
                      <div className="w-1 h-6 -ml-6 rounded-r-full bg-menuActive" />

                      {/* Title */}
                      <div>
                        <h6 className=" text-white/60">Last 7 days Activity</h6>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={dashboard.requestsLast7Days}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorCount"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={COLORS.primary}
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor={COLORS.primary}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          stroke="#9ca3af"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          tick={{ fontSize: 12 }}
                          width={35} // 👈 reduce space
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke={COLORS.primary}
                          strokeWidth={3}
                          fill="url(#colorCount)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
