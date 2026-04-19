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
  MoreVertical,
  Eye,
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<DashboardData>("/api/dashboard");
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

  const MetricCard = ({ title, value, description, icon: Icon, trend, color = "primary" }: any) => {
    const colorConfig = {
      primary: { bg: "from-blue-500 to-blue-600", light: "bg-blue-50", text: "text-blue-600" },
      success: { bg: "from-emerald-500 to-emerald-600", light: "bg-emerald-50", text: "text-emerald-600" },
      warning: { bg: "from-amber-500 to-amber-600", light: "bg-amber-50", text: "text-amber-600" },
      info: { bg: "from-cyan-500 to-cyan-600", light: "bg-cyan-50", text: "text-cyan-600" },
      purple: { bg: "from-purple-500 to-purple-600", light: "bg-purple-50", text: "text-purple-600" },
    };

    return (
      <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <div className="absolute inset-0  opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="mt-2 flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {trend && (
                <div className={`flex items-center ${trend >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {trend >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  <span className="text-sm font-semibold">{Math.abs(trend)}%</span>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          </div>
          <div className={`rounded-xl ${colorConfig[color].light} p-3 shadow-sm`}>
            <Icon className={`h-5 w-5 ${colorConfig[color].text}`} />
          </div>
        </div>
      </div>
    );
  };

  const StatusCard = ({ label, value, color, icon: Icon, percentage }: any) => (
    <div className="group flex items-center justify-between rounded-lg p-3 transition-all duration-200 hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className={`rounded-lg p-2 ${color === COLORS.success ? 'bg-emerald-100' : 
          color === COLORS.warning ? 'bg-amber-100' : 
          color === COLORS.error ? 'bg-red-100' : 'bg-gray-100'}`}>
          <Icon className={`h-4 w-4 ${color === COLORS.success ? 'text-emerald-600' : 
            color === COLORS.warning ? 'text-amber-600' : 
            color === COLORS.error ? 'text-red-600' : 'text-gray-600'}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="text-xs text-gray-500">{percentage.toFixed(1)}% of total</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Requests: <span className="font-semibold text-blue-600">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-6 text-lg font-semibold text-gray-900">Loading Dashboard</p>
          <p className="mt-2 text-sm text-gray-500">Fetching your latest analytics...</p>
        </div>
      </div>
    );
  }

  const getPieChartData = () => {
    if (!dashboard) return [];
    const total = Object.values(dashboard.apiStatusCounts).reduce((a, b) => a + b, 0);
    return [
      { name: "Success", value: dashboard.apiStatusCounts.SUCCESS, color: COLORS.success },
      { name: "Key Not Active", value: dashboard.apiStatusCounts.KEY_NOT_ACTIVE, color: COLORS.neutral },
      { name: "Limit Exceeded", value: dashboard.apiStatusCounts.LIMIT_EXCEED, color: COLORS.warning },
      { name: "Errors", value: dashboard.apiStatusCounts.EXTERNAL_ERROR + dashboard.apiStatusCounts.INTERNAL_SERVER, color: COLORS.error },
    ].filter(item => item.value > 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-white shadow-sm">
          <div className="px-6 py-8">
            <div className="flex flex-col items-start justify-between space-y-4 lg:flex-row lg:items-center lg:space-y-0">
              <div>
                <div className="flex items-center space-x-3">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                      Dashboard Overview
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                      Monitor your API keys and usage analytics
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <RefreshCw className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
                <button
                  onClick={() => fetchData()}
                  className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-md"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {dashboard && (
          <>
            {/* Key Metrics Grid */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <MetricCard
                title="Total Keys"
                value={dashboard.totalAliasKeys.toLocaleString()}
                description="All keys created"
                icon={Key}
                color="primary"
              />
              <MetricCard
                title="Active Keys"
                value={dashboard.activeAliasKeys.toLocaleString()}
                description="Currently active"
                icon={CheckCircle}
                color="success"
              />
              <MetricCard
                title="Pending Keys"
                value={dashboard.pendingAliasKeys.toLocaleString()}
                description="Awaiting approval"
                icon={Clock}
                color="warning"
              />
              <MetricCard
                title="Total Requests"
                value={dashboard.totalRequests.toLocaleString()}
                description="All-time API calls"
                icon={Activity}
                color="info"
              />
              <MetricCard
                title="Monthly Requests"
                value={dashboard.totalAliasRequestsCurrentMonth.toLocaleString()}
                description="This month"
                icon={Calendar}
                color="purple"
              />
            </div>

            {/* Charts Section */}
            <div className="mb-8 grid gap-8 lg:grid-cols-2">
              {/* Request Activity Chart */}
              <div className="rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="border-b border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Request Activity
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        API requests over the last 7 days
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none">
                        <option>Last 7 days</option>
                        <option>Last 14 days</option>
                        <option>Last 30 days</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboard.requestsLast7Days}>
                        <defs>
                          <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          fill="url(#colorRequests)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Quota Usage Card */}
              <div className="rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="border-b border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Quota Usage
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Current billing period consumption
                      </p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-2.5">
                      <Gauge className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Usage Rate</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {dashboard.quota.usedPercent}%
                      </span>
                    </div>
                    <div className="relative h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="absolute h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700"
                        style={{ width: `${dashboard.quota.usedPercent}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">Total Quota</p>
                      <p className="mt-1 text-xl font-bold text-gray-900">
                        {dashboard.quota.totalQuota.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">Used Quota</p>
                      <p className="mt-1 text-xl font-bold text-blue-600">
                        {dashboard.quota.usedQuota.toLocaleString()}
                      </p>
                    </div>
                    <div className="col-span-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
                      <p className="text-xs text-emerald-600">Remaining Quota</p>
                      <p className="mt-1 text-2xl font-bold text-emerald-600">
                        {dashboard.quota.remainingQuota.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Distribution Section */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Status Distribution */}
              <div className="rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="border-b border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Response Distribution
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        API response status breakdown
                      </p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-2.5">
                      <PieChartIcon className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700">Total Responses</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {Object.values(dashboard.apiStatusCounts).reduce((a, b) => a + b, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <StatusCard
                      label="Success"
                      value={dashboard.apiStatusCounts.SUCCESS}
                      color={COLORS.success}
                      icon={ThumbsUp}
                      percentage={(dashboard.apiStatusCounts.SUCCESS / Object.values(dashboard.apiStatusCounts).reduce((a, b) => a + b, 0)) * 100}
                    />
                    <StatusCard
                      label="Key Not Active"
                      value={dashboard.apiStatusCounts.KEY_NOT_ACTIVE}
                      color={COLORS.neutral}
                      icon={MinusCircle}
                      percentage={(dashboard.apiStatusCounts.KEY_NOT_ACTIVE / Object.values(dashboard.apiStatusCounts).reduce((a, b) => a + b, 0)) * 100}
                    />
                    <StatusCard
                      label="Limit Exceeded"
                      value={dashboard.apiStatusCounts.LIMIT_EXCEED}
                      color={COLORS.warning}
                      icon={AlertTriangle}
                      percentage={(dashboard.apiStatusCounts.LIMIT_EXCEED / Object.values(dashboard.apiStatusCounts).reduce((a, b) => a + b, 0)) * 100}
                    />
                    <StatusCard
                      label="Errors"
                      value={dashboard.apiStatusCounts.EXTERNAL_ERROR + dashboard.apiStatusCounts.INTERNAL_SERVER}
                      color={COLORS.error}
                      icon={ThumbsDown}
                      percentage={((dashboard.apiStatusCounts.EXTERNAL_ERROR + dashboard.apiStatusCounts.INTERNAL_SERVER) / Object.values(dashboard.apiStatusCounts).reduce((a, b) => a + b, 0)) * 100}
                    />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="border-b border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Recent Activity
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Latest API interactions
                      </p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-orange-50 to-red-50 p-2.5">
                      <Activity className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Last Request</p>
                        <p className="text-xs text-gray-500">
                          {dashboard.lastRequestAt ? new Date(dashboard.lastRequestAt).toLocaleString() : 'No requests yet'}
                        </p>
                      </div>
                      <div className="rounded-full bg-blue-100 p-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900">Time Since Last Request</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {dashboard.lastRequestMinutesAgo !== null ? `${dashboard.lastRequestMinutesAgo}` : "0"} minutes
                          </p>
                        </div>
                        <Zap className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Daily Average</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {(dashboard.totalRequests / 30).toFixed(0)} requests/day
                          </p>
                        </div>
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                      </div>
                    </div>
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