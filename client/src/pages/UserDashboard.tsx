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
} from "recharts";
import {
  Key,
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
  PieChart,
  User,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

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

  const MetricCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    color = "primary",
  }: any) => {
    const gradientColors = {
      primary: "from-blue-500 to-indigo-600",
      success: "from-emerald-500 to-teal-600",
      warning: "from-amber-500 to-orange-600",
      info: "from-cyan-500 to-blue-600",
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
                {trend && (
                  <div
                    className={`flex items-center ${trend >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {trend >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span className="text-base font-semibold">
                      {Math.abs(trend)}%
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">{description}</p>
            </div>
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${gradientColors[color]} shadow-lg`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
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
            Requests: <span className="font-medium">{payload[0].value}</span>
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <p className="mt-6 text-xl font-semibold text-gray-900">
            Loading Dashboard
          </p>
          <p className="mt-2 text-base text-gray-500">
            Fetching your latest analytics...
          </p>
        </div>
      </div>
    );
  }

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
                <div className="p-2 shadow-lg rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                  <User className="text-white w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    User Dashboard
                  </h1>
                  <p className="mt-1 text-gray-500">
                    Monitor your keys and API usage
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center mt-4 space-x-4 lg:mt-0">
              <div className="flex items-center px-4 py-2 space-x-2 bg-white border border-gray-100 shadow-sm rounded-xl">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span className="text-base text-gray-600">Active</span>
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
            <div className="grid gap-6 mb-10 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Keys"
                value={dashboard.totalAliasKeys.toLocaleString()}
                description="All keys created by you"
                icon={Key}
                color="primary"
              />
              <MetricCard
                title="Active Keys"
                value={dashboard.activeAliasKeys.toLocaleString()}
                description="Keys ready to use"
                icon={CheckCircle}
                color="success"
              />
              <MetricCard
                title="Pending Keys"
                value={dashboard.pendingAliasKeys.toLocaleString()}
                description="Keys awaiting approval"
                icon={Clock}
                color="warning"
              />
              <MetricCard
                title="Monthly Key"
                value={dashboard.totalAliasRequestsCurrentMonth.toLocaleString()}
                description="Key requests this month"
                icon={Calendar}
                color="info"
              />
              <MetricCard
                title="Total Requests"
                value={dashboard.totalRequests.toLocaleString()}
                description="API calls processed"
                icon={Activity}
                color="info"
              />
            </div>

            <div className="grid gap-8 mb-10 lg:grid-cols-2">
              {/* Request Activity Chart */}
              <div className="space-y-8">
                {/* Quota Usage */}
                {/* <div className="overflow-hidden transition-shadow duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Quota Usage
                        </h3>
                        <p className="mt-1 text-base text-gray-500">
                          Active  quota consumption
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                        <Gauge className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base text-gray-600">
                          Total Quota
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {dashboard.quota.totalQuota.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base text-gray-600">
                          Used Quota
                        </span>
                        <span className="text-lg font-semibold text-blue-600">
                          {dashboard.quota.usedQuota.toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-base">
                          <span className="text-gray-600">Usage</span>
                          <span className="font-semibold text-gray-900">
                            {dashboard.quota.usedPercent}%
                          </span>
                        </div>
                        <div className="w-full h-3 overflow-hidden bg-gray-100 rounded-full">
                          <div
                            className="h-full transition-all duration-700 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                            style={{ width: `${dashboard.quota.usedPercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-base text-gray-600">
                          Remaining Quota
                        </span>
                        <span className="text-lg font-semibold text-emerald-600">
                          {dashboard.quota.remainingQuota.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div> */}

                {/* Status Breakdown */}
                <div className="overflow-hidden transition-shadow duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
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
                    <div className="space-y-4">
                      {[
                        {
                          label: "Success",
                          value: dashboard.apiStatusCounts.SUCCESS,
                          statusText: "SUCCESS",
                          color: "bg-emerald-500",
                          icon: CheckCircle,
                        },
                        {
                          label: "Key Not Active",
                          value: dashboard.apiStatusCounts.KEY_NOT_ACTIVE,
                          statusText: "KEY_NOT_ACTIVE",
                          color: "bg-slate-500",
                          icon: Key,
                        },
                        {
                          label: "Limit Exceeded",
                          value: dashboard.apiStatusCounts.LIMIT_EXCEED,
                          statusText: "LIMIT_EXCEED",
                          color: "bg-amber-500",
                          icon: Zap,
                        },
                        {
                          label: "Internal server error",
                          value: dashboard.apiStatusCounts.INTERNAL_SERVER,
                          statusText: "INTERNAL_SERVER",
                          color: "bg-rose-500",
                          icon: AlertCircle,
                        },
                      ].map((item) => {
                        const totalRequests =
                          dashboard.apiStatusCounts.SUCCESS +
                          dashboard.apiStatusCounts.KEY_NOT_ACTIVE +
                          dashboard.apiStatusCounts.LIMIT_EXCEED +
                          dashboard.apiStatusCounts.INTERNAL_SERVER;
                        const percentage = totalRequests
                          ? (item.value / totalRequests) * 100
                          : 0;
                        return (
                          <div key={item.label} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <item.icon className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-base font-medium text-gray-700">
                                    {item.label}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-base font-semibold text-gray-900">
                                  {item.value.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                              <div
                                className={`${item.color} h-full transition-all duration-700 rounded-full`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Latest Request */}
                {/* <div className="overflow-hidden shadow-xl bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-blue-200" />
                        <h3 className="text-lg font-semibold text-white">
                          Latest Activity
                        </h3>
                      </div>
                      <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-white">
                        {dashboard.lastRequestMinutesAgo !== null
                          ? `${dashboard.lastRequestMinutesAgo}`
                          : "0"}
                      </p>
                      <p className="text-base text-blue-200">
                        {dashboard.lastRequestMinutesAgo !== null
                          ? `minutes since last request`
                          : "No requests found yet"}
                      </p>
                      {dashboard.lastRequestAt && (
                        <p className="mt-2 text-xs text-blue-300">
                          Last request at:{" "}
                          {new Date(dashboard.lastRequestAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div> */}
              </div>
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
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboard.requestsLast7Days}>
                        <defs>
                          <linearGradient
                            id="colorRequests"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3b82f6"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3b82f6"
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
                          stroke="#3b82f6"
                          strokeWidth={3}
                          fill="url(#colorRequests)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Right Column */}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
