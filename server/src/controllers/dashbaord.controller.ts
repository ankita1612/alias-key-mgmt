import { Request, Response, NextFunction } from "express";
import ApiHistoryModel from "../models/apiHistory.model";
import AliasKeyModel from "../models/aliasKey.model";
import User from "../models/user.model";
import ProxyModel from "../models/proxy.model";

interface AuthRequest extends Request {
  user?: any;
}

class DashboardController {
  getDeshboardData = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized user" });
      }

      // Get time filter from query params, default to "today"
      const timeFilter = (req.query.timeFilter as string) || "today";
      const now = new Date();

      // Calculate date ranges based on filter
      let startDate: Date;
      switch (timeFilter) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          break;
        case "week":
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
          weekStart.setHours(0, 0, 0, 0);
          startDate = weekStart;
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "all":
        default:
          startDate = new Date(0); // Beginning of time
          break;
      }

      if (req.user.role === "User") {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const sevenDaysAgo = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - 6,
            0,
            0,
            0,
            0,
          ),
        );

        const [
          totalAliasKeys,
          activeAliasKeys,
          inactiveAliasKeys,
          approvedAliasKeys,
          pendingAliasKeys,
          rejectedAliasKeys,
          totalAliasRequestsCurrentMonth,
          lastRequest,
          statusAggregates,
          activeQuotaDocs,
          aliasStatusBreakdown,
          requestsLast7DaysAggregate,
          totalQuotaAgg,
          totalUsedQuotaAgg,
          totalFailedQuotaAgg,
        ] = await Promise.all([
          AliasKeyModel.countDocuments({ user_id: userId }),
          AliasKeyModel.countDocuments({
            user_id: userId,
            key_status: "Active",
          }),
          AliasKeyModel.countDocuments({
            user_id: userId,
            key_status: "Inactive",
          }),
          AliasKeyModel.countDocuments({
            user_id: userId,
            approval_status: "Approved",
          }),
          AliasKeyModel.countDocuments({
            user_id: userId,
            approval_status: "Pending",
          }),
          AliasKeyModel.countDocuments({
            user_id: userId,
            approval_status: "Rejected",
          }),
          AliasKeyModel.countDocuments({
            user_id: userId,
            createdAt: { $gte: monthStart, $lt: now },
          }),
          ApiHistoryModel.findOne({ user_id: userId })
            .sort({ createdAt: -1 })
            .select("createdAt")
            .lean(),
          ApiHistoryModel.aggregate([
            {
              $match: {
                user_id: userId,
                createdAt: { $gte: startDate },
              },
            },
            {
              $group: {
                _id: "$response_code_str",
                count: { $sum: 1 },
              },
            },
          ]),
          AliasKeyModel.find({ user_id: userId, key_status: "Active" })
            .select("total_quota remaining_quota")
            .lean(),
          AliasKeyModel.aggregate([
            {
              $match: { user_id: userId },
            },
            {
              $group: {
                _id: {
                  key_status: "$key_status",
                  approval_status: "$approval_status",
                },
                count: { $sum: 1 },
              },
            },
          ]),
          ApiHistoryModel.aggregate([
            {
              $match: {
                user_id: userId,
                createdAt: { $gte: sevenDaysAgo },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: "UTC",
                  },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ]),
          // Quota aggregations for user
          AliasKeyModel.aggregate([
            {
              $match: { user_id: userId },
            },
            {
              $group: {
                _id: null,
                totalQuota: { $sum: "$total_quota" },
              },
            },
          ]),
          ApiHistoryModel.countDocuments({
            user_id: userId,
            response_code_str: "SUCCESS",
          }),
          ApiHistoryModel.countDocuments({
            user_id: userId,
            response_code_str: { $ne: "SUCCESS" },
          }),
        ]);

        const statusCounts = {
          SUCCESS: 0,
          LIMIT_EXCEED: 0,
          INTERNAL_SERVER: 0,
          KEY_NOT_ACTIVE: 0,
          EXTERNAL_ERROR: 0,
          INVALID_PROXY: 0,
          PARAM_MISSING: 0,
        };
        statusAggregates.forEach((item: any) => {
          const key = item._id as keyof typeof statusCounts;
          if (Object.prototype.hasOwnProperty.call(statusCounts, key)) {
            statusCounts[key] = item.count;
          }
        });

        const totalStatusCount =
          statusCounts.SUCCESS +
          statusCounts.LIMIT_EXCEED +
          statusCounts.INTERNAL_SERVER +
          statusCounts.KEY_NOT_ACTIVE;

        // Get total requests count for all time (without filter)
        const totalRequestsAllTime = await ApiHistoryModel.countDocuments({
          user_id: userId,
        });

        const statusPercentages = {
          SUCCESS: totalStatusCount
            ? Math.round((statusCounts.SUCCESS / totalStatusCount) * 100)
            : 0,
          LIMIT_EXCEED: totalStatusCount
            ? Math.round((statusCounts.LIMIT_EXCEED / totalStatusCount) * 100)
            : 0,
          INTERNAL_SERVER: totalStatusCount
            ? Math.round(
                (statusCounts.INTERNAL_SERVER / totalStatusCount) * 100,
              )
            : 0,
          KEY_NOT_ACTIVE: totalStatusCount
            ? Math.round((statusCounts.KEY_NOT_ACTIVE / totalStatusCount) * 100)
            : 0,
        };

        const breakdownMap = {
          Active: { Approved: 0, Pending: 0, Rejected: 0 },
          Inactive: { Approved: 0, Pending: 0, Rejected: 0 },
        };
        aliasStatusBreakdown.forEach((item: any) => {
          const keyStatus = item._id?.key_status as keyof typeof breakdownMap;
          const approvalStatus = item._id
            ?.approval_status as keyof (typeof breakdownMap)["Active"];
          if (
            breakdownMap[keyStatus] &&
            Object.prototype.hasOwnProperty.call(
              breakdownMap[keyStatus],
              approvalStatus,
            )
          ) {
            breakdownMap[keyStatus][approvalStatus] = item.count;
          }
        });

        const totalQuota = activeQuotaDocs.reduce(
          (sum: number, item: any) => sum + (item.total_quota || 0),
          0,
        );
        const usedQuota = activeQuotaDocs.reduce((sum: number, item: any) => {
          const remaining = item.remaining_quota ?? 0;
          return sum + Math.max(0, (item.total_quota || 0) - remaining);
        }, 0);

        const aggregatedMap = requestsLast7DaysAggregate.reduce(
          (acc: Record<string, number>, item: any) => {
            if (item._id) {
              acc[item._id] = item.count;
            }
            return acc;
          },
          {},
        );

        const requestsLast7Days = [] as Array<{ date: string; count: number }>;
        for (let i = 0; i < 7; i++) {
          const day = new Date(
            Date.UTC(
              sevenDaysAgo.getUTCFullYear(),
              sevenDaysAgo.getUTCMonth(),
              sevenDaysAgo.getUTCDate() + i,
              0,
              0,
              0,
              0,
            ),
          );
          const iso = day.toISOString().slice(0, 10);
          requestsLast7Days.push({
            date: day.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            count: aggregatedMap[iso] || 0,
          });
        }

        const lastRequestMinutesAgo = lastRequest?.createdAt
          ? Math.round(
              (Date.now() - new Date(lastRequest.createdAt).getTime()) /
                1000 /
                60,
            )
          : null;

        // Extract API Quota values for User
        const apiQuotaTotal = totalQuotaAgg?.[0]?.totalQuota || 0;
        const apiQuotaUsed = totalUsedQuotaAgg || 0;
        const apiQuotaFailed = totalFailedQuotaAgg || 0;
        const apiQuotaRemaining = Math.max(0, apiQuotaTotal - apiQuotaUsed);

        return res.json({
          totalAliasKeys,
          activeAliasKeys,
          inactiveAliasKeys,
          approvedAliasKeys,
          pendingAliasKeys,
          rejectedAliasKeys,
          totalAliasRequestsCurrentMonth,
          lastRequestMinutesAgo,
          lastRequestAt: lastRequest?.createdAt || null,
          totalRequests: totalStatusCount,
          totalRequestsAllTime,
          apiStatusCounts: statusCounts,
          aliasStatusCounts: {
            approvalStatus: {
              Approved: approvedAliasKeys,
              Pending: pendingAliasKeys,
              Rejected: rejectedAliasKeys,
            },
            keyStatus: {
              Active: activeAliasKeys,
              Inactive: inactiveAliasKeys,
            },
            breakdown: breakdownMap,
          },
          quota: {
            totalQuota,
            usedQuota,
            remainingQuota: Math.max(0, totalQuota - usedQuota),
            usedPercent: totalQuota
              ? Math.round((usedQuota / totalQuota) * 100)
              : 0,
          },
          apiQuota: {
            totalQuota: apiQuotaTotal,
            totalUsedQuota: apiQuotaUsed,
            totalFailedQuota: apiQuotaFailed,
            remainingQuota: apiQuotaRemaining,
          },
          requestsLast7Days,
        });
      }

      if (req.user.role === "Admin") {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1,
        );
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const sevenDaysAgo = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - 6,
            0,
            0,
            0,
            0,
          ),
        );

        const [
          totalUsers,
          currentMonthUsers,
          previousMonthUsers,
          approvedAliasKeys,
          pendingApprovals,
          rejectedAliasKeys,
          activeAliasKeys,
          inactiveAliasKeys,
          overallTotalRequests,
          filteredTotalRequests,
          totalAliasKeysAdmin,
          aliasStatusAggregates,
          apiStatusAggregates,
          requestsLast7DaysAggregate,
          totalProxy,
          totalQuotaAgg,
          totalUsedQuotaAgg,
          totalFailedQuotaAgg,
        ] = await Promise.all([
          User.countDocuments({ role: "User" }),
          User.countDocuments({
            role: "User",
            createdAt: { $gte: monthStart, $lt: now },
          }),
          User.countDocuments({
            role: "User",
            createdAt: { $gte: previousMonthStart, $lt: previousMonthEnd },
          }),
          AliasKeyModel.countDocuments({ approval_status: "Approved" }),
          AliasKeyModel.countDocuments({ approval_status: "Pending" }),
          AliasKeyModel.countDocuments({ approval_status: "Rejected" }),
          AliasKeyModel.countDocuments({ key_status: "Active" }),
          AliasKeyModel.countDocuments({ key_status: "Inactive" }),
          ApiHistoryModel.countDocuments(),
          ApiHistoryModel.countDocuments(
            timeFilter === "all" ? {} : { createdAt: { $gte: startDate } },
          ),
          AliasKeyModel.countDocuments(),
          AliasKeyModel.aggregate([
            {
              $group: {
                _id: {
                  key_status: "$key_status",
                  approval_status: "$approval_status",
                },
                count: { $sum: 1 },
              },
            },
          ]),
          ApiHistoryModel.aggregate([
            {
              $match:
                timeFilter === "all"
                  ? {}
                  : {
                      createdAt: { $gte: startDate },
                    },
            },
            {
              $group: {
                _id: "$response_code_str",
                count: { $sum: 1 },
              },
            },
          ]),
          ApiHistoryModel.aggregate([
            {
              $match: {
                createdAt: { $gte: sevenDaysAgo },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: "UTC",
                  },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ]),
          ProxyModel.countDocuments({ is_deleted: false }),
          // Quota aggregations
          AliasKeyModel.aggregate([
            {
              $group: {
                _id: null,
                totalQuota: { $sum: "$total_quota" },
              },
            },
          ]),
          ApiHistoryModel.countDocuments({
            response_code_str: "SUCCESS",
          }),
          ApiHistoryModel.countDocuments({
            response_code_str: { $ne: "SUCCESS" },
          }),
        ]);

        const aliasStatusBreakdown = {
          Active: { Approved: 0, Pending: 0, Rejected: 0 },
          Inactive: { Approved: 0, Pending: 0, Rejected: 0 },
        };
        aliasStatusAggregates.forEach((item: any) => {
          const keyStatus = item._id
            ?.key_status as keyof typeof aliasStatusBreakdown;
          const approvalStatus = item._id
            ?.approval_status as keyof (typeof aliasStatusBreakdown)["Active"];
          if (
            aliasStatusBreakdown[keyStatus] &&
            Object.prototype.hasOwnProperty.call(
              aliasStatusBreakdown[keyStatus],
              approvalStatus,
            )
          ) {
            aliasStatusBreakdown[keyStatus][approvalStatus] = item.count;
          }
        });

        const aliasStatusCounts = {
          approvalStatus: {
            Approved: approvedAliasKeys,
            Pending: pendingApprovals,
            Rejected: rejectedAliasKeys,
          },
          keyStatus: {
            Active: activeAliasKeys,
            Inactive: inactiveAliasKeys,
          },
          breakdown: aliasStatusBreakdown,
        };

        const apiStatusCounts = {
          SUCCESS: 0,
          LIMIT_EXCEED: 0,
          INTERNAL_SERVER: 0,
          KEY_NOT_ACTIVE: 0,
          EXTERNAL_ERROR: 0,
          INVALID_PROXY: 0,
          PARAM_MISSING: 0,
        };
        apiStatusAggregates.forEach((item: any) => {
          const key = item._id as keyof typeof apiStatusCounts;
          if (Object.prototype.hasOwnProperty.call(apiStatusCounts, key)) {
            apiStatusCounts[key] = item.count;
          }
        });

        const totalRequestForRate =
          apiStatusCounts.SUCCESS +
          apiStatusCounts.LIMIT_EXCEED +
          apiStatusCounts.INTERNAL_SERVER +
          apiStatusCounts.KEY_NOT_ACTIVE;
        const requestSuccessRate = totalRequestForRate
          ? Math.round((apiStatusCounts.SUCCESS / totalRequestForRate) * 100)
          : 0;

        const userGrowthPercent = previousMonthUsers
          ? Math.round(
              ((currentMonthUsers - previousMonthUsers) / previousMonthUsers) *
                100,
            )
          : currentMonthUsers
            ? 100
            : 0;

        const aggregatedRequestMap = requestsLast7DaysAggregate.reduce(
          (acc: Record<string, number>, item: any) => {
            if (item._id) {
              acc[item._id] = item.count;
            }
            return acc;
          },
          {},
        );

        // Extract quota values
        const totalQuota = totalQuotaAgg?.[0]?.totalQuota || 0;
        const totalUsedQuota = totalUsedQuotaAgg || 0;
        const totalFailedQuota = totalFailedQuotaAgg || 0;
        const remainingQuota = Math.max(0, totalQuota - totalUsedQuota);

        const requestsLast7Days = [] as Array<{ date: string; count: number }>;
        for (let i = 0; i < 7; i++) {
          const day = new Date(
            Date.UTC(
              sevenDaysAgo.getUTCFullYear(),
              sevenDaysAgo.getUTCMonth(),
              sevenDaysAgo.getUTCDate() + i,
              0,
              0,
              0,
              0,
            ),
          );
          const iso = day.toISOString().slice(0, 10);
          requestsLast7Days.push({
            date: day.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            count: aggregatedRequestMap[iso] || 0,
          });
        }

        return res.json({
          totalUsers,
          userGrowthPercent,
          approvedAliasKeys,
          pendingApprovals,
          totalRequests: overallTotalRequests,
          responseOverviewTotal: filteredTotalRequests,
          totalAliasKeys: totalAliasKeysAdmin,
          requestSuccessRate,
          aliasStatusCounts,
          apiStatusCounts,
          requestsLast7Days,
          totalProxy,
          apiQuota: {
            totalQuota,
            totalUsedQuota,
            totalFailedQuota,
            remainingQuota,
          },
        });
      }

      return res.status(403).json({ message: "Forbidden" });
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
