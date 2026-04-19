import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
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
  pendingAliasKeys: number;
  totalAliasRequestsCurrentMonth: number;
  lastRequestMinutesAgo: number | null;
  lastRequestAt: string | null;
  totalRequests: number;
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
      setDashboard(response.data);
      setLastUpdated(new Date());
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
            "Failed to load data",
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

    return (
      <div className="flex items-center gap-3 px-4 py-4 transition bg-white border-t rounded-lg shadow-sm hover:shadow-md">
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
        <div className="flex flex-col justify-center flex-1">
          {/* VALUE (center focus) */}
          <p className={`text-xl font-bold text-center ${valueColor}`}>
            {value}
          </p>

          {/* TITLE (below) */}
          <p className="mt-1 text-xs text-center text-gray-600 ">{title}</p>
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-gray-200 rounded-full animate-spin border-t-blue-600" />
          <p className="mt-6 text-lg font-semibold text-gray-900">
            Loading Dashboard
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Fetching your latest analytics...
          </p>
        </div>
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {dashboard && (
          <>
            {/* Key Metrics Grid */}
            <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <StatCard
                title="Total Keys"
                value={dashboard.totalAliasKeys.toLocaleString()}
                description="All keys created"
                icon=""
                color="primary"
                valueColor="text-black"
              />
              <StatCard
                title="Active Keys"
                value={dashboard.activeAliasKeys.toLocaleString()}
                description="Currently active"
                icon=""
                color="success"
                valueColor="text-blue-500"
              />
              <StatCard
                title="Pending Keys"
                value={dashboard.pendingAliasKeys.toLocaleString()}
                description="Awaiting approval"
                icon=""
                color="warning"
                valueColor="text-red-500"
              />
              <StatCard
                title="Total Requests"
                value={dashboard.totalRequests.toLocaleString()}
                description="All-time API calls"
                icon=""
                color="info"
                valueColor="text-orange-500"
              />
              <StatCard
                title="Total Quota"
                value={dashboard.quota.totalQuota.toLocaleString()}
                subtitle="Waiting approval"
                icon=""
                color="warning"
                valueColor="text-blue-900"
              />
              <StatCard
                title="Used Quota"
                value={dashboard.quota.usedQuota.toLocaleString()}
                subtitle="Waiting approval"
                icon=""
                color="warning"
                valueColor="text-green-900"
              />
              <StatCard
                title="Remaining Quota"
                value={dashboard.quota.remainingQuota.toLocaleString()}
                subtitle="Waiting approval"
                icon=""
                color="warning"
                valueColor="text-red-900"
              />
            </div>

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
                        <h6 className=" sm:text-xl text-white/60">
                          Response Overview
                        </h6>
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
                      // {
                      //   label: "Internal Server Error",
                      //   value: dashboard?.apiStatusCounts?.INTERNAL_SERVER,
                      //   color: COLORS.error,
                      //   icon: AlertCircle,
                      // },
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
                        <h6 className=" sm:text-xl text-white/60">
                          Last 7 days Activity
                        </h6>
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
                          width={30} // 👈 reduce space
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
