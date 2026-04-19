import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import apiClient from "../services/apiClient";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  Key,
  Clock,
  Activity,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Database,
  RefreshCw,
  Shield,
  PieChart,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Server,
  Globe,
  Cpu,
  XCircle,
  AlertTriangle,
  ServerCrash,
  BarChart3,
  Filter,
  ChevronDown,
} from "lucide-react";

interface AdminDashboardData {
  totalUsers: number;
  userGrowthPercent: number;
  approvedAliasKeys: number;
  pendingApprovals: number;
  totalRequests: number;
  totalAliasKeys: number;
  requestSuccessRate: number;
  aliasStatusCounts: {
    Active: number;
    Pending: number;
    Inactive: number;
    Rejected: number;
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
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeFilter, setTimeFilter] = useState<string>("today");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response =
        await apiClient.get<AdminDashboardData>(`/api/dashboard?timeFilter=${timeFilter}`);
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
          <p className="text-sm font-bold leading-tight text-gray-900">
            {value}
          </p>
          <p className="text-[10px] text-gray-500  tracking-wide">{title}</p>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <p className="mt-6 text-xl font-semibold text-gray-900">
            Loading Dashboard
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Fetching latest analytics data...
          </p>
        </div>
      </div>
    );
  }

  const aliasStatusData = dashboard
    ? [
        { name: "Active", value: dashboard.aliasStatusCounts.Active },
        { name: "Pending", value: dashboard.aliasStatusCounts.Pending },
        { name: "Inactive", value: dashboard.aliasStatusCounts.Inactive },
        { name: "Rejected", value: dashboard.aliasStatusCounts.Rejected },
      ].filter((item) => item.value > 0)
    : [];
  const TopStatCard = ({ title, value }: any) => {
    return (
      <div className="px-4 py-3 transition bg-white border border-t-4 rounded-lg shadow-sm border-primary hover:shadow">
        <p className="text-[11px] text-gray-500 uppercase">{title}</p>
        <p className="mt-1 text-lg font-semibold">{value}</p>
      </div>
    );
  };
  return (
    <div className="min-h-screen ">
      {/* Background Pattern */}
      {/* <div className="fixed inset-0 pointer-events-none opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div> */}

      <div className="">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div>
                  <h5 className="font-bold sm:text-xl">
                    Key managment Overview
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {dashboard && (
          <>
            <div className="grid gap-4 mb-6 sm:grid-cols-3">
              <TopStatCard
                title="Total Users"
                value={dashboard.totalUsers.toLocaleString()}
              />
              <TopStatCard
                title="Total Proxy"
                value={dashboard.totalProxy.toLocaleString()}
              />
              <TopStatCard
                title="Total Requests"
                value={dashboard.totalRequests.toLocaleString()}
              />
            </div>
            <h6 className="pb-2">Key Monitoring</h6>
            <div className="grid gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total Keys"
                value={dashboard.totalAliasKeys.toLocaleString()}
                subtitle="All keys"
                icon={Key}
                color="primary"
              />

              <StatCard
                title="Active Keys"
                value={dashboard.approvedAliasKeys.toLocaleString()}
                subtitle="Approved keys"
                icon={CheckCircle}
                color="success"
              />

              <StatCard
                title="Pending Keys"
                value={dashboard.pendingApprovals.toLocaleString()}
                subtitle="Waiting approval"
                icon={Clock}
                color="warning"
              />
            </div>
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
                        <h6 className=" sm:text-xl text-white/60">
                          Response Overview
                        </h6>
                      </div>
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
                          label: "Key Not Active",
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
                          label: "Proxy key deleted ",
                          value: dashboard?.apiStatusCounts?.INVALID_PROXY,
                          color: COLORS.pending,
                          icon: XCircle,
                        },
                        {
                          label: "Request params missing",
                          value: dashboard?.apiStatusCounts?.PARAM_MISSING,
                          color: COLORS.secondary,
                          icon: AlertTriangle,
                        },
                        {
                          label: "API call error",
                          value: dashboard?.apiStatusCounts?.EXTERNAL_ERROR,
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
                        const total = dashboard?.totalRequests || 0;
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
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Request Activity
                      </h3>
                      <p className="text-xs text-gray-500">Last 7 days</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboard.requestsLast7Days}>
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
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
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
