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
} from "recharts";

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
    Success: number;
    Fail: number;
    Limit_exceed: number;
    Alias_key_inactive: number;
  };
  requestsLast7Days: Array<{ date: string; count: number }>;
}

function AdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response =
        await apiClient.get<AdminDashboardData>("/api/dashboard");
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

  const renderCard = (
    title: string,
    value: string | number,
    subtitle: string,
  ) => (
    <div className="p-6 transition bg-white border shadow-sm rounded-3xl border-slate-200 hover:-translate-y-1 hover:shadow-lg">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      <h2 className="mt-4 text-4xl font-semibold text-slate-900">{value}</h2>
      <p className="mt-3 text-sm text-slate-500">{subtitle}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="px-8 py-10 bg-white shadow-lg rounded-3xl">
          <p className="text-lg font-semibold text-slate-900">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 md:p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Admin analytics
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Global platform summary
          </h1>
        </div>
        <div className="px-4 py-3 text-sm shadow-sm rounded-3xl bg-slate-50 text-slate-700">
          Live overview of alias keys, users, and requests.
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard && (
          <>
            {renderCard(
              "Total users",
              dashboard.totalUsers.toLocaleString(),
              `+${dashboard.userGrowthPercent}% from last month`,
            )}
            {renderCard(
              "Approved keys",
              dashboard.approvedAliasKeys.toLocaleString(),
              "Active alias keys currently approved",
            )}
            {renderCard(
              "Pending approvals",
              dashboard.pendingApprovals.toLocaleString(),
              "Keys waiting for admin review",
            )}
            {renderCard(
              "Total requests",
              dashboard.totalRequests.toLocaleString(),
              "All API calls recorded in the system",
            )}
            {renderCard(
              "Total alias keys",
              dashboard.totalAliasKeys.toLocaleString(),
              "Complete alias key inventory",
            )}
            {renderCard(
              "Request success rate",
              `${dashboard.requestSuccessRate}%`,
              "Measured across all API traffic",
            )}
          </>
        )}
      </div>

      {dashboard && (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_0.7fr]">
          <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Alias key status mix
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Track how keys are distributed across statuses.
                </p>
              </div>
            </div>

            <div className="mt-6 h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Active",
                      value: dashboard.aliasStatusCounts.Active,
                    },
                    {
                      name: "Pending",
                      value: dashboard.aliasStatusCounts.Pending,
                    },
                    {
                      name: "Inactive",
                      value: dashboard.aliasStatusCounts.Inactive,
                    },
                    {
                      name: "Rejected",
                      value: dashboard.aliasStatusCounts.Rejected,
                    },
                  ]}
                >
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Requests trend
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  API activity over the past 7 days.
                </p>
              </div>
            </div>

            <div className="mt-6 h-[320px] w-full">
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
                    stroke="#0f766e"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {dashboard && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              API status breakdown
            </h3>
            <div className="mt-5 space-y-4">
              {[
                {
                  label: "Success",
                  value: dashboard.apiStatusCounts.Success,
                  color: "bg-emerald-500",
                },
                {
                  label: "Fail",
                  value: dashboard.apiStatusCounts.Fail,
                  color: "bg-rose-500",
                },
                {
                  label: "Limit exceed",
                  value: dashboard.apiStatusCounts.Limit_exceed,
                  color: "bg-amber-500",
                },
                {
                  label: "Alias inactive",
                  value: dashboard.apiStatusCounts.Alias_key_inactive,
                  color: "bg-slate-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`${item.color} inline-block h-3 w-3 rounded-full`}
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-200 lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Platform pulse
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Snapshot of user growth, alias key approval, and active workload.
            </p>
            <div className="grid gap-4 mt-6 sm:grid-cols-3">
              <div className="p-4 rounded-3xl bg-slate-50">
                <p className="text-sm text-slate-500">Active alias keys</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {dashboard.approvedAliasKeys.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-3xl bg-slate-50">
                <p className="text-sm text-slate-500">Pending approvals</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {dashboard.pendingApprovals.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-3xl bg-slate-50">
                <p className="text-sm text-slate-500">Success rate</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {dashboard.requestSuccessRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
