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
} from "recharts";

interface DashboardData {
  totalAliasKeys: number;
  activeAliasKeys: number;
  pendingAliasKeys: number;
  totalAliasRequestsCurrentMonth: number;
  lastRequestMinutesAgo: number | null;
  lastRequestAt: string | null;
  statusCounts: {
    Success: number;
    Fail: number;
    Limit_exceed: number;
  };
  statusPercentages: {
    Success: number;
    Fail: number;
    Limit_exceed: number;
  };
  quota: {
    totalQuota: number;
    usedQuota: number;
    remainingQuota: number;
    usedPercent: number;
  };
  requestsLast7Days: Array<{ date: string; count: number }>;
}

function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<DashboardData>("/api/dashboard");
      setDashboard(response.data);
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

  const renderMetricCard = (
    title: string,
    value: number | string,
    description: string,
  ) => (
    <div className="p-5 transition bg-white border shadow-sm rounded-2xl border-slate-200 hover:shadow-md">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900">{value}</h2>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="px-6 py-10 bg-white shadow rounded-2xl">
          <p className="text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 md:p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Your usage summary
          </h1>
        </div>
        <div className="px-4 py-3 text-sm shadow-sm rounded-2xl bg-slate-50 text-slate-700">
          Data updated for your current user account
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboard
          ? [
              {
                title: "Total alias keys",
                value: dashboard.totalAliasKeys,
                description: "All alias keys created by you.",
              },
              {
                title: "Active alias keys",
                value: dashboard.activeAliasKeys,
                description: "Keys ready to use today.",
              },
              {
                title: "Pending alias keys",
                value: dashboard.pendingAliasKeys,
                description: "Keys awaiting approval.",
              },
              {
                title: "Aliases this month",
                value: dashboard.totalAliasRequestsCurrentMonth,
                description: "Alias requests created this month.",
              },
            ].map((card) => (
              <div key={card.title}>
                {renderMetricCard(card.title, card.value, card.description)}
              </div>
            ))
          : null}
      </div>

      {dashboard && (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_0.7fr]">
          <div className="p-6 space-y-6 bg-white border shadow-sm rounded-3xl border-slate-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Request activity
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Last 7 days of API requests.
                </p>
              </div>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dashboard.requestsLast7Days}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 space-y-6 bg-white border shadow-sm rounded-3xl border-slate-200">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Quota usage
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Active aliases quota and consumption overview.
              </p>
            </div>

            <div className="p-4 space-y-4 rounded-3xl bg-slate-50">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Total quota</span>
                <span>{dashboard.quota.totalQuota.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Used quota</span>
                <span>{dashboard.quota.usedQuota.toLocaleString()}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-600"
                  style={{ width: `${dashboard.quota.usedPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Remaining</span>
                <span>{dashboard.quota.remainingQuota.toLocaleString()}</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {dashboard.quota.usedPercent}% of quota used
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-slate-50">
                <h3 className="text-sm font-medium text-slate-900">
                  Status breakdown
                </h3>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      label: "Success",
                      value: dashboard.statusCounts.Success,
                      percent: dashboard.statusPercentages.Success,
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Fail",
                      value: dashboard.statusCounts.Fail,
                      percent: dashboard.statusPercentages.Fail,
                      color: "bg-rose-500",
                    },
                    {
                      label: "Limit exceed",
                      value: dashboard.statusCounts.Limit_exceed,
                      percent: dashboard.statusPercentages.Limit_exceed,
                      color: "bg-amber-500",
                    },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-slate-700">
                        <span>{item.label}</span>
                        <span>
                          {item.value} requests • {item.percent}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div
                          className={`${item.color} h-full rounded-full`}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-slate-50">
                <h3 className="text-sm font-medium text-slate-900">
                  Latest request
                </h3>
                <p className="mt-3 text-sm text-slate-600">
                  {dashboard.lastRequestMinutesAgo !== null
                    ? `${dashboard.lastRequestMinutesAgo} minutes ago`
                    : "No requests found yet."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
