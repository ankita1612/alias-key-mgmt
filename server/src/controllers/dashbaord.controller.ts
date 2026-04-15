import { Request, Response, NextFunction } from "express";
import ApiHistoryModel from "../models/apiHistory.model";
import AliasKeyModel from "../models/aliasKey.model";
import User from "../models/user.model";

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

      if (req.user.role === "User") {
        const now = new Date();
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
          pendingAliasKeys,
          totalAliasRequestsCurrentMonth,
          lastRequest,
          statusAggregates,
          activeQuotaDocs,
          requestsLast7DaysAggregate,
        ] = await Promise.all([
          AliasKeyModel.countDocuments({ user_id: userId }),
          AliasKeyModel.countDocuments({ user_id: userId, status: "Active" }),
          AliasKeyModel.countDocuments({ user_id: userId, status: "Pending" }),
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
              },
            },
            {
              $group: {
                _id: "$response_code_str",
                count: { $sum: 1 },
              },
            },
          ]),
          AliasKeyModel.find({ user_id: userId, status: "Active" })
            .select("total_quota remaining_quota")
            .lean(),
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
        ]);

        const statusCounts = {
          SUCCESS: 0,
          LIMIT_EXCEED: 0,
          INTERNAL_SERVER: 0,
          KEY_NOT_ACTIVE: 0,
           EXTERNAL_ERROR:0,
           INVALID_PROXY:0,
            PARAM_MISSING:0
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

        return res.json({
          totalAliasKeys,
          activeAliasKeys,
          pendingAliasKeys,
          totalAliasRequestsCurrentMonth,
          lastRequestMinutesAgo,
          lastRequestAt: lastRequest?.createdAt || null,
          totalRequests: totalStatusCount,
          apiStatusCounts: statusCounts,
          quota: {
            totalQuota,
            usedQuota,
            remainingQuota: Math.max(0, totalQuota - usedQuota),
            usedPercent: totalQuota
              ? Math.round((usedQuota / totalQuota) * 100)
              : 0,
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
          totalRequests,
          totalAliasKeysAdmin,
          aliasStatusAggregates,
          apiStatusAggregates,
          requestsLast7DaysAggregate,
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
          AliasKeyModel.countDocuments({ status: "Active" }),
          AliasKeyModel.countDocuments({ status: "Pending" }),
          ApiHistoryModel.countDocuments(),
          AliasKeyModel.countDocuments(),
          AliasKeyModel.aggregate([
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ]),
          ApiHistoryModel.aggregate([
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
        ]);

        const aliasStatusCounts = {
          Active: 0,
          Pending: 0,
          Inactive: 0,
          Rejected: 0,
        };
        aliasStatusAggregates.forEach((item: any) => {
          const key = item._id as keyof typeof aliasStatusCounts;
          if (Object.prototype.hasOwnProperty.call(aliasStatusCounts, key)) {
            aliasStatusCounts[key] = item.count;
          }
        });

        const apiStatusCounts = {
          SUCCESS: 0,
          LIMIT_EXCEED: 0,
          INTERNAL_SERVER: 0,
          KEY_NOT_ACTIVE: 0,
          EXTERNAL_ERROR:0,
           INVALID_PROXY:0,
            PARAM_MISSING:0
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
          totalRequests,
          totalAliasKeys: totalAliasKeysAdmin,
          requestSuccessRate,
          aliasStatusCounts,
          apiStatusCounts,
          requestsLast7Days,
        });
      }

      return res.status(403).json({ message: "Forbidden" });
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
