import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaExchangeAlt, FaHome } from "react-icons/fa";
import { toast } from "react-hot-toast";
import apiClient from "../services/apiClient";

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  Key,
  Clock,
  Activity,
  CheckCircle,
  Shield,
  Zap,
  XCircle,
  AlertTriangle,
  ServerCrash,
  Filter,
  ChevronDown,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Navigate } from "react-router-dom";

interface AdminDashboardData {
  totalUsers: number;
  userGrowthPercent: number;
  approvedAliasKeys: number;
  pendingApprovals: number;
  totalRequests: number;
  responseOverviewTotal: number;
  totalAliasKeys: number;
  requestSuccessRate: number;
  aliasStatusCounts: {
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
  apiStatusCounts: {
    SUCCESS: number;
    LIMIT_EXCEED: number;
    INTERNAL_SERVER: number;
    KEY_NOT_ACTIVE: number;
    EXTERNAL_ERROR: number;
    INVALID_PROXY: number;
    PARAM_MISSING: number;
  };
  requestsLast7Days: Array<{ date: string; count: number }>;
  totalProxy: number;
}

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

const PIE_COLORS = [
  COLORS.active,
  COLORS.pending,
  COLORS.inactive,
  COLORS.rejected,
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
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
      const response = await apiClient.get<AdminDashboardData>(
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
    subtitle,
    icon: Icon,
    trend,
    color = "primary",
  }: any) => {
    const gradientColors = {
      primary: "from-indigo-500 to-purple-600",
      success: "from-emerald-500 to-teal-600",
      warning: "from-amber-500 to-orange-600",
      info: "from-blue-500 to-cyan-600",
    };

    return (
      <div className="flex items-center gap-3 px-4 py-4 transition bg-white border rounded-lg shadow-sm hover:shadow-md">
        {/* Icon */}
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br ${
            gradientColors[color as keyof typeof gradientColors]
          }`}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex flex-col">
            <p className="text-xs text-slate-500 font-medium mt-0.5">{title}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Value:{" "}
            <span className="font-medium">
              {payload[0].value.toLocaleString()}
            </span>
          </p>
        </div>
      );
    }
    return null;
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

  const aliasStatusData = dashboard
    ? [
        {
          name: "Approved",
          value: dashboard.aliasStatusCounts?.approvalStatus?.Approved || 0,
        },
        {
          name: "Pending",
          value: dashboard.aliasStatusCounts?.approvalStatus?.Pending || 0,
        },
        {
          name: "Rejected",
          value: dashboard.aliasStatusCounts?.approvalStatus?.Rejected || 0,
        },
        {
          name: "Active",
          value: dashboard.aliasStatusCounts?.keyStatus?.Active || 0,
        },
        {
          name: "Inactive",
          value: dashboard.aliasStatusCounts?.keyStatus?.Inactive || 0,
        },
      ].filter((item) => item.value > 0)
    : [];
  const safeStatusCounts = dashboard?.aliasStatusCounts || {
    approvalStatus: { Approved: 0, Pending: 0, Rejected: 0 },
    keyStatus: { Active: 0, Inactive: 0 },
  };

  const TopStatCard = ({
    title,
    value,
    icon: Icon,
    iconColor,
    onClick,
  }: any) => {
    const iconBg = iconColor?.replace("text-", "bg-")?.replace("-600", "-100");

    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 transition bg-white border-t-4 rounded-lg shadow-sm border-menuActive 
      ${onClick ? "cursor-pointer hover:shadow-md" : ""} group`}
      >
        {/* LEFT ICON */}
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-transform duration-200 ${
            iconBg || "bg-gray-100"
          } group-hover:scale-110`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex flex-col">
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-lg font-semibold text-primary">{value}</p>
        </div>
      </div>
    );
  };
  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* <div>
              <div className="flex items-center space-x-3">
                <div>
                  <h5 className="font-bold sm:text-xl">
                    Key management Overview
                  </h5>
                  <p className="mt-1 text-xs text-slate-500">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div> */}

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
                onClick={() => navigate("/alias-key")}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-primary/90"
              >
                <Key className="w-4 h-4" />
                Manage Keys
              </button>
            </div> */}
          </div>
        </div>

        {/* Stats Grid */}
        {dashboard && (
          <>
            {/* Top Stats Row */}
            <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3">
              <TopStatCard
                title="Total Users"
                value={dashboard.totalUsers.toLocaleString()}
                icon={Users}
                iconColor="text-blue-600"
                onClick={undefined}
              />
              <TopStatCard
                title="Total Proxy"
                value={dashboard.totalProxy.toLocaleString()}
                icon={FaExchangeAlt}
                iconColor="text-purple-600"
                onClick={undefined}
              />
              <TopStatCard
                title="Total API Requests"
                value={dashboard.totalRequests.toLocaleString()}
                icon={Activity}
                iconColor="text-green-600"
                onClick={undefined}
              />
              <TopStatCard
                title="Success Rate"
                value={`${dashboard.requestSuccessRate?.toFixed(1) || 0}%`}
                icon={CheckCircle}
                iconColor="text-emerald-600"
                onClick={undefined}
              />
            </div>

            {/* Pending Approvals Alert */}
            {/* {dashboard.aliasStatusCounts?.approvalStatus?.Pending > 0 && (
              <div className="flex items-center gap-4 p-4 mb-6 border-l-4 rounded-md shadow-sm bg-amber-50 border-amber-500">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-full bg-amber-100">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">
                    {dashboard.aliasStatusCounts.approvalStatus.Pending} Pending
                    Request
                    {dashboard.aliasStatusCounts.approvalStatus.Pending > 1
                      ? "s"
                      : ""}
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Awaiting your approval. Review and act on these requests to
                    help developers get access.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/alias-key?approvalStatus=Pending")}
                  className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200 whitespace-nowrap"
                >
                  Review
                </button>
              </div>
            )} */}

            {/* Key Monitoring Row */}
            <h6 className="pb-2 text-sm font-semibold text-gray-700">
              Key Monitoring - Approval Status
            </h6>
            <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Keys"
                value={dashboard.totalAliasKeys.toLocaleString()}
                subtitle="All keys"
                icon={Key}
                color="primary"
              />

              <StatCard
                title="Approved"
                value={
                  dashboard.aliasStatusCounts?.approvalStatus?.Approved?.toLocaleString() ||
                  "0"
                }
                subtitle="Approved keys"
                icon={CheckCircle}
                color="success"
              />

              <StatCard
                title="Pending Approval"
                value={
                  dashboard.aliasStatusCounts?.approvalStatus?.Pending?.toLocaleString() ||
                  "0"
                }
                subtitle="Awaiting review"
                icon={Clock}
                color="warning"
              />

              <StatCard
                title="Rejected"
                value={
                  dashboard.aliasStatusCounts?.approvalStatus?.Rejected?.toLocaleString() ||
                  "0"
                }
                subtitle="Rejected keys"
                icon={XCircle}
                color="info"
              />
            </div>

            {/* Key Status Row */}
            {/* <h6 className="pb-2 text-sm font-semibold text-gray-700">
              Key Monitoring - Activation Status
            </h6>
            <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Active Keys"
                value={
                  dashboard.aliasStatusCounts?.keyStatus?.Active?.toLocaleString() ||
                  "0"
                }
                subtitle="Currently active"
                icon={CheckCircle}
                color="success"
              />

              <StatCard
                title="Inactive Keys"
                value={
                  dashboard.aliasStatusCounts?.keyStatus?.Inactive?.toLocaleString() ||
                  "0"
                }
                subtitle="Deactivated"
                icon={XCircle}
                color="info"
              />
            </div> */}

            {/* Key Status Summary */}
            <div className="grid gap-4 mb-6 lg:grid-cols-2">
              {/* Active Keys Card */}
              <div className="overflow-hidden transition-shadow duration-300 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                <div className="px-5 py-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 shadow-sm bg-emerald-500 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-600">
                          Key Status
                        </p>
                        <h3 className="text-xl font-bold text-emerald-800">
                          Active Keys
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-emerald-700">
                        {dashboard.aliasStatusCounts?.keyStatus?.Active?.toLocaleString() ||
                          "0"}
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
                          dashboard.aliasStatusCounts?.breakdown?.Active
                            ?.Approved || 0,
                        color: "emerald",
                        icon: CheckCircle,
                      },
                      {
                        label: "Pending",
                        value:
                          dashboard.aliasStatusCounts?.breakdown?.Active
                            ?.Pending || 0,
                        color: "amber",
                        icon: Clock,
                      },
                      {
                        label: "Rejected",
                        value:
                          dashboard.aliasStatusCounts?.breakdown?.Active
                            ?.Rejected || 0,
                        color: "red",
                        icon: XCircle,
                      },
                    ].map((item) => {
                      const total =
                        dashboard.aliasStatusCounts?.keyStatus?.Active || 1;
                      const percentage = (item.value / total) * 100;

                      return (
                        <div key={item.label} className="group">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <item.icon
                                className={`w-3.5 h-3.5 text-${item.color}-500`}
                              />
                              <span className="text-sm text-gray-600">
                                {item.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {item.value.toLocaleString()}
                              </span>
                              {/* <span className="text-xs text-gray-400">
                                ({percentage.toFixed(1)}%)
                              </span> */}
                            </div>
                          </div>
                          {/* <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                            <div
                              className={`h-full rounded-full transition-all duration-500 bg-${item.color}-500 group-hover:bg-${item.color}-600`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div> */}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Inactive Keys Card */}
              <div className="overflow-hidden transition-shadow duration-300 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-500 shadow-sm rounded-xl">
                        <XCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Key Status
                        </p>
                        <h3 className="text-xl font-bold text-gray-800">
                          Inactive Keys
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-700">
                        {dashboard.aliasStatusCounts?.keyStatus?.Inactive?.toLocaleString() ||
                          "0"}
                      </p>
                      <p className="text-xs text-gray-500">Total Inactive</p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  {/* <p className="mb-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Approval Breakdown
                  </p> */}
                  <div className="space-y-4">
                    {[
                      {
                        label: "Approved",
                        value:
                          dashboard.aliasStatusCounts?.breakdown?.Inactive
                            ?.Approved || 0,
                        color: "emerald",
                        icon: CheckCircle,
                      },
                      {
                        label: "Pending",
                        value:
                          dashboard.aliasStatusCounts?.breakdown?.Inactive
                            ?.Pending || 0,
                        color: "amber",
                        icon: Clock,
                      },
                      {
                        label: "Rejected",
                        value:
                          dashboard.aliasStatusCounts?.breakdown?.Inactive
                            ?.Rejected || 0,
                        color: "red",
                        icon: XCircle,
                      },
                    ].map((item) => {
                      const total =
                        dashboard.aliasStatusCounts?.keyStatus?.Inactive || 1;
                      const percentage = (item.value / total) * 100;

                      return (
                        <div key={item.label} className="group">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <item.icon
                                className={`w-3.5 h-3.5 text-${item.color}-500`}
                              />
                              <span className="text-sm text-gray-600">
                                {item.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {item.value.toLocaleString()}
                              </span>
                              {/* <span className="text-xs text-gray-400">
                                ({percentage.toFixed(1)}%)
                              </span> */}
                            </div>
                          </div>
                          {/* <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                            <div
                              className={`h-full rounded-full transition-all duration-500 bg-${item.color}-500 group-hover:bg-${item.color}-600`}
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

            {/* Quick Actions / System Status Row */}
            {/* <div className="grid gap-4 mb-6 lg:grid-cols-3"> */}
            {/* Pending Requests Alert */}
            {/* {dashboard.pendingApprovals > 0 && (
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-amber-50 border-amber-200">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">
                      {dashboard.pendingApprovals} Pending Request
                      {dashboard.pendingApprovals > 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-amber-600">
                      Awaiting your approval
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/alias-key?status=Pending")}
                    className="px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 rounded-md hover:bg-amber-200"
                  >
                    Review
                  </button>
                </div>
              )} */}

            {/* Key Status Distribution */}
            {/* <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="mb-3 text-sm font-medium text-gray-700">
                  Key Status Distribution
                </p>
                <div className="space-y-2">
                  {[
                    {
                      label: "Active",
                      count: dashboard.aliasStatusCounts?.Active,
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Pending",
                      count: dashboard.aliasStatusCounts?.Pending,
                      color: "bg-amber-500",
                    },
                    {
                      label: "Inactive",
                      count: dashboard.aliasStatusCounts?.Inactive,
                      color: "bg-gray-400",
                    },
                    {
                      label: "Rejected",
                      count: dashboard.aliasStatusCounts?.Rejected,
                      color: "bg-red-500",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-xs text-gray-600">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-900">
                        {item.count || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div> */}

            {/* API Health Overview */}
            {/* <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="mb-3 text-sm font-medium text-gray-700">
                  API Health
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Success</span>
                    <span className="text-xs font-semibold text-emerald-600">
                      {dashboard.apiStatusCounts?.SUCCESS?.toLocaleString() ||
                        0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Limit Exceeded
                    </span>
                    <span className="text-xs font-semibold text-amber-600">
                      {dashboard.apiStatusCounts?.LIMIT_EXCEED?.toLocaleString() ||
                        0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Errors</span>
                    <span className="text-xs font-semibold text-red-600">
                      {(
                        (dashboard.apiStatusCounts?.EXTERNAL_ERROR || 0) +
                        (dashboard.apiStatusCounts?.INTERNAL_SERVER || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div> */}
            {/* </div> */}
            {/* Charts Grid */}
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
                        <h6 className="text-white/60">Response Overview</h6>
                        <p className="mt-1 text-xs text-indigo-100/80">
                          Showing{" "}
                          {(
                            dashboard?.responseOverviewTotal ??
                            dashboard?.totalRequests ??
                            0
                          ).toLocaleString()}{" "}
                          requests for {filterLabels[timeFilter]}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT - Time Filter */}
                    <TimeFilterDropdown />
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
                        const percentage =
                          total > 0 ? (value / total) * 100 : 0;

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
              </div>
              {/* API Requests Trend */}
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

export default AdminDashboard;
