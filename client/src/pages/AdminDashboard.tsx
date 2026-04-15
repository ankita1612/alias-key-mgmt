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
  BarChart3,
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
  };
  requestsLast7Days: Array<{ date: string; count: number }>;
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response =
        await apiClient.get<AdminDashboardData>("/api/dashboard");
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
  }, []);

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
      <div className="relative overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm group rounded-2xl hover:shadow-xl">
        <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-gray-50 to-transparent group-hover:opacity-100" />
        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-base font-medium tracking-wider text-gray-500 uppercase">
                {title}
              </p>
              <div className="flex items-baseline mt-2 space-x-2">
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                {trend !== undefined && (
                  <div
                    className={`flex items-center ${trend >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {/* {trend >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span className="text-base font-semibold">
                      {Math.abs(trend)}%
                    </span> */}
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
            </div>
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${gradientColors[color as keyof typeof gradientColors]} shadow-lg`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          {/* {trend !== undefined && (
            <div className="mt-4">
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${trend >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                  style={{ width: `${Math.min(Math.abs(trend), 100)}%` }}
                />
              </div>
            </div>
          )} */}
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="text-base font-semibold text-gray-900">{label}</p>
          <p className="text-base text-gray-600">
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
          <p className="mt-2 text-base text-gray-500">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative px-6 py-8 md:px-8 lg:px-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="p-2 shadow-lg rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Shield className="text-white w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Admin Dashboard
                  </h1>
                  <p className="mt-1 text-gray-500">
                    Monitor platform performance and system health
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center mt-4 space-x-4 lg:mt-0">
              <div className="flex items-center px-4 py-2 space-x-2 bg-white border border-gray-100 shadow-sm rounded-xl">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-base text-gray-600">Live</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Last updated</p>
                <p className="text-base font-medium text-gray-700">
                  {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={fetchData}
                className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {dashboard && (
          <>
            <div className="grid gap-6 mb-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <StatCard
                title="Total Users"
                value={dashboard.totalUsers.toLocaleString()}
                subtitle="Registered accounts"
                icon={Users}
                trend={dashboard.userGrowthPercent}
                color="primary"
              />
              <StatCard
                title="Total Keys"
                value={dashboard.totalAliasKeys.toLocaleString()}
                subtitle="Total keys"
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
                subtitle="Keys awaiting approval"
                icon={Clock}
                color="warning"
              />
              <StatCard
                title="Total Requests"
                value={dashboard.totalRequests.toLocaleString()}
                subtitle="API calls processed"
                icon={Activity}
                color="info"
              />
              {/* <StatCard
                title="Success Rate"
                value={`${dashboard.requestSuccessRate}%`}
                subtitle="Request success rate"
                icon={CheckCircle}
                color="success"
              /> */}
            </div>

            {/* Charts Grid */}
            <div className="grid gap-8 mb-10 lg:grid-cols-2">
              {/* <div className="overflow-hidden transition-shadow duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Aliad Key Status Distribution
                      </h3>
                      <p className="mt-1 text-base text-gray-500">
                        Breakdown of all keys by status
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="w-full h-[320px] min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <Pie
                          data={
                            aliasStatusData.length
                              ? aliasStatusData
                              : [{ name: "No Data", value: 1 }]
                          }
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            percent > 0
                              ? `${name} ${(percent * 100).toFixed(0)}%`
                              : null
                          }
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dashboard.aliasStatusCounts &&
                            Object.values(dashboard.aliasStatusCounts).map(
                              (_, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                                />
                              ),
                            )}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div> */}
              <div className="overflow-hidden transition-shadow duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                <div className="p-6 border-b border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Distribution of API response types
                        </h3>
                        <p className="mt-1 text-base text-gray-500">
                          API response distribution
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                        <PieChart className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="text-base font-medium text-gray-700">
                        Total responses tracked
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {(
                          dashboard.apiStatusCounts.SUCCESS +
                          dashboard.apiStatusCounts.KEY_NOT_ACTIVE +
                          dashboard.apiStatusCounts.LIMIT_EXCEED +
                          dashboard.apiStatusCounts.INTERNAL_SERVER
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-5">
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
                        console.log(percentage);

                        // ✅ Better display with appropriate precision
                        const formattedPercentage =
                          percentage === 0
                            ? "0%"
                            : percentage < 0.01
                              ? "< 0.01%"
                              : percentage < 1
                                ? `${percentage.toFixed(2)}%`
                                : `${percentage.toFixed(1)}%`;
                        console.log(formattedPercentage);
                        // ✅ Ensure bar is visible
                        const progressWidth =
                          percentage > 0 && percentage < 1 ? 1 : percentage;

                        return (
                          <div key={status.label} className="space-y-2">
                            {/* Top Row */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <status.icon className="w-4 h-4 text-gray-400" />
                                <span className="text-base font-medium text-gray-700">
                                  {status.label}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <span className="text-base font-semibold text-gray-900">
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
              <div className="overflow-hidden transition-shadow duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Request Activity
                      </h3>
                      <p className="mt-1 text-base text-gray-500">
                        API requests over the last 7 days
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
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

            {/* Additional Metrics */}
            <div className="grid gap-8 md:grid-cols-2">
              {/* API Status Breakdown */}
              {/* <div className="transition-shadow duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        API Response Status
                      </h3>
                      <p className="mt-1 text-base text-gray-500">
                        Distribution of API response types
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50">
                      <Zap className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-5">
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
                        icon: Clock,
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
                      const percentage = total > 0 ? (value / total) * 100 : 0;

                      // ✅ Better display
                      const formattedPercentage =
                        percentage > 0 && percentage < 0.01
                          ? "< 0.01%"
                          : `${percentage.toFixed(1)}%`;

                      // ✅ Ensure bar is visible
                      const progressWidth =
                        percentage > 0 && percentage < 1 ? 1 : percentage;

                      return (
                        <div key={status.label} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <status.icon className="w-4 h-4 text-gray-400" />
                              <span className="text-base font-medium text-gray-700">
                                {status.label}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-base font-semibold text-gray-900">
                                {(value || 0).toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formattedPercentage}
                              </span>
                            </div>
                          </div>

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
              </div> */}

              {/* Key Metrics Overview */}
              {/* <div className="overflow-hidden shadow-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Platform Health
                      </h3>
                      <p className="mt-1 text-base text-indigo-200">
                        Key performance indicators
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                      <Server className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-base text-indigo-200">System Uptime</p>
                        <p className="text-base font-semibold text-white">
                          99.95%
                        </p>
                      </div>
                      <div className="w-full h-2 overflow-hidden rounded-full bg-white/20">
                        <div
                          className="h-full bg-white rounded-full"
                          style={{ width: "99.95%" }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Cpu className="w-4 h-4 text-indigo-200" />
                          <p className="text-base text-indigo-200">
                            Avg Response Time
                          </p>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-white">
                          247ms
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-indigo-200" />
                          <p className="text-base text-indigo-200">Error Rate</p>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-white">
                          {(
                            (dashboard.apiStatusCounts.INTERNAL_SERVER /
                              dashboard.totalRequests) *
                            100
                          ).toFixed(2)}
                          %
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 mt-2 border-t border-white/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-indigo-200" />
                          <p className="text-base text-indigo-200">
                            Active Monitoring
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium text-green-400 rounded-full bg-green-400/10">
                          Healthy
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
