import { Request, Response, NextFunction } from "express";
import IUser, { IUserAliasKey } from "../interface/IAliasKey.interface";
import ApiError from "../utils/api.error";
import { Types } from "mongoose";
const msgTitle = "Key";
import { UserType } from "../interface/user.interface";
import ApiHistoryModel from "../models/apiHistory.model";
import AliasKeyModel from "../models/aliasKey.model";
//import redisClient from "../config/redis.config";
//import IUser from "../interface/IUserAliasKey.interface";

const generateAliasKey = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  for (let i = 0; i < 24; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};
class AliasKeyController {
  // ✅ CREATE
  addData = async (
    req: Request<{}, {}, IUserAliasKey>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = req.body;
      const userId = req?.user?._id; // 👈 from auth middleware

      const existingProject = await AliasKeyModel.findOne({
        project_name: data.project_name,
      });

      // ✅ Decide value
      const proxyPermission = existingProject ? "Old" : "New";
      const result = await AliasKeyModel.create({
        user_id: userId,
        domain_name: data.domain_name,
        project_name: data.project_name,
        proxy_id: data.proxy_id,
        proxy_permission_required: proxyPermission,
        approval_status:
          req?.user?.role === UserType.USER ? "Pending" : "Approved",
        key_status: "Active",
        total_quota: data.total_quota,
        total_estimated_cost: data.total_estimated_cost,
        cost_calculation: data.cost_calculation,
        description: data.description,

        ...(req?.user?.role == UserType.ADMIN && {
          remaining_quota: data.total_quota,
        }),
      });

      if (req?.user?.role === UserType.ADMIN) {
        const aliasKey = await this.generateUniqueAliasKey();

        await AliasKeyModel.findByIdAndUpdate(result._id, {
          alias_key: aliasKey,
          approval_status: "Approved",
          remaining_quota: data.total_quota, // ✅ correct
        });

        // Optional: update response object
        result.alias_key = aliasKey;
      }

      res.status(201).json({
        success: true,
        message: `${msgTitle} created successfully`,
        result,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Alias key already exists",
        });
      }
      next(error);
    }
  };

  // ✅ GET SINGLE
  getData = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid ID" });
        return;
      }

      const data = await AliasKeyModel.findById(id);

      if (!data) {
        res.status(404).json({
          success: false,
          message: `${msgTitle} not found`,
        });
        return;
      }

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
  getDatasKeyMonitor = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = ((req.query.search as string) || "").trim();

      // 🔥 Filter params
      const key_statusFilter = req.query.key_status as string;
      const approval_statusFilter = req.query.approval_status as string;

      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const sortBy = req.query.sortBy as string;
      const sortField = req.query.sortField as string;
      const sortOrder = req.query.sortOrder as string;
      const finalSortBy = (sortBy || sortField || "createdAt") as string;
      if (![UserType.ADMIN, UserType.USER].includes(req.user.role)) {
        throw new ApiError("You are not allowed access", 403);
      }

      const skip = (Number(page) - 1) * Number(limit);

      // 🔥 Base match
      const match: any = {
        key_status: { $in: ["Active", "Inactive"] }, // ✅ FIXED condition
      };
      match.approval_status = "Approved";
      // 🔥 Add status filter
      if (
        key_statusFilter &&
        ["Active", "Inactive"].includes(key_statusFilter)
      ) {
        match.key_status = key_statusFilter;
      }

      if (approval_statusFilter) {
        match.approval_status = approval_statusFilter;
      }

      // 🔥 Add date range filter
      if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) {
          match.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          // Set to end of day
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          match.createdAt.$lte = end;
        }
      }

      if (req.user.role === UserType.USER) {
        match.user_id = new Types.ObjectId(req.user.id);
      }
      const sortMap: any = {
        "user.first_name": "user_first_name",
        "user.email": "user_email",
      };

      const finalSortField = sortMap[finalSortBy] || finalSortBy; // 🔥 Search condition
      const searchMatch = search
        ? {
            $or: [
              { alias_key: { $regex: search, $options: "i" } },
              { domain_name: { $regex: search, $options: "i" } },
              { key_status: { $regex: search, $options: "i" } },
              { approval_status: { $regex: search, $options: "i" } },
              { "user.first_name": { $regex: search, $options: "i" } },
              { "user.email": { $regex: search, $options: "i" } },

              // ✅ numeric search (partial match)
              {
                $expr: {
                  $regexMatch: {
                    input: { $toString: "$total_quota" },
                    regex: search,
                    options: "i",
                  },
                },
              },
            ],
          }
        : {};

      const pipeline: any[] = [
        { $match: match },

        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },

        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "proxies",
            localField: "proxy_id",
            foreignField: "_id",
            as: "proxy",
          },
        },
        { $unwind: { path: "$proxy", preserveNullAndEmptyArrays: true } },

        // ✅ ADD THIS
        {
          $addFields: {
            user_first_name: { $ifNull: ["$user.first_name", ""] },
            user_email: { $ifNull: ["$user.email", ""] },
            query_params: { $ifNull: ["$proxy.query_params", ""] },
          },
        },

        ...(search ? [{ $match: searchMatch }] : []),

        // ✅ UPDATED SORT
        {
          $sort: {
            [finalSortField]: sortOrder === "asc" ? 1 : -1,
          },
        },

        { $skip: skip },
        { $limit: Number(limit) },
      ];

      const countPipeline = [
        { $match: match },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        ...(search ? [{ $match: searchMatch }] : []),
        { $count: "total" },
      ];

      const [data, countResult] = await Promise.all([
        AliasKeyModel.aggregate(pipeline),
        AliasKeyModel.aggregate(countPipeline),
      ]);

      const total = countResult[0]?.total || 0;
      //fetch history
      // 🔥 Get active alias IDs
      const activeAliasIds = data
        .filter(
          (item) =>
            item.key_status === "Active" || item.key_status === "Inactive",
        )
        .map((item) => item._id);

      // 🔥 Default stats (used everywhere)
      const defaultStats = {
        total_history_records: 0,
        total_success: 0,
        total_limit_exceed: 0,
        total_internal_server: 0,
        total_key_not_active: 0,
        total_extrenal_error: 0,
        total_invalid_proxy: 0,
        total_invalid_params: 0,
      };

      // 🔥 Fetch stats ONLY if active aliases exist
      let stats: any[] = [];

      if (activeAliasIds.length > 0) {
        stats = await ApiHistoryModel.aggregate([
          {
            $match: {
              user_alias_key_id: { $in: activeAliasIds },
            },
          },
          {
            $group: {
              _id: "$user_alias_key_id",

              total_history_records: { $sum: 1 },

              total_success: {
                $sum: {
                  $cond: [{ $eq: ["$response_code_str", "SUCCESS"] }, 1, 0],
                },
              },

              total_limit_exceed: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "LIMIT_EXCEED"] },
                    1,
                    0,
                  ],
                },
              },

              total_internal_server: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "INTERNAL_SERVER"] }, // ⚠️ check typo
                    1,
                    0,
                  ],
                },
              },

              total_key_not_active: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "KEY_NOT_ACTIVE"] },
                    1,
                    0,
                  ],
                },
              },
              total_extrenal_error: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "EXTERNAL_ERROR"] },
                    1,
                    0,
                  ],
                },
              },
              total_invalid_proxy: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "INVALID_PROXY"] },
                    1,
                    0,
                  ],
                },
              },
              total_invalid_params: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "PARAM_MISSING"] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]);
      }

      // 🔥 Convert to map for O(1) lookup
      const statsMap: Record<string, any> = {};

      for (const item of stats) {
        const key = String(item._id);
        statsMap[key] = item;
      }

      // 🔥 Merge stats into paginated data
      const finalData = data.map((item) => {
        // ❌ If not active → return default stats
        if (!(item.key_status === "Active" || item.key_status === "Inactive")) {
          return {
            ...item,
            ...defaultStats,
          };
        }

        const stat = statsMap[String(item._id)] || defaultStats;

        return {
          ...item,
          ...defaultStats, // ensures all fields exist
          ...stat, // overwrite with actual values if present
        };
      });
      //end fetch

      res.status(200).json({
        success: true,
        data: finalData,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };
  getDatasKeyMonitorDeleted = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = ((req.query.search as string) || "").trim();

      const sortBy = req.query.sortBy as string;
      const sortField = req.query.sortField as string;
      const sortOrder = req.query.sortOrder as string;
      const finalSortBy = (sortBy || sortField || "createdAt") as string;
      if (![UserType.ADMIN, UserType.USER].includes(req.user.role)) {
        throw new ApiError("You are not allowed access", 403);
      }

      const skip = (Number(page) - 1) * Number(limit);

      // 🔥 Base match
      const match: any = {
        key_status: { $in: ["Active", "Inactive"] }, // ✅ FIXED condition
      };
      if (req.user.role === UserType.USER) {
        match.user_id = new Types.ObjectId(req.user.id);
      }
      const sortMap: any = {
        "user.first_name": "user_first_name",
        "user.email": "user_email",
      };

      const finalSortField = sortMap[finalSortBy] || finalSortBy; // 🔥 Search condition
      const searchMatch = search
        ? {
            $or: [
              { alias_key: { $regex: search, $options: "i" } },
              { domain_name: { $regex: search, $options: "i" } },
              { key_status: { $regex: search, $options: "i" } },
              { approval_status: { $regex: search, $options: "i" } },
              { "user.first_name": { $regex: search, $options: "i" } },
              { "user.email": { $regex: search, $options: "i" } },

              // ✅ numeric search (partial match)
              {
                $expr: {
                  $regexMatch: {
                    input: { $toString: "$total_quota" },
                    regex: search,
                    options: "i",
                  },
                },
              },
            ],
          }
        : {};

      const pipeline: any[] = [
        { $match: match },

        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },

        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "proxies",
            localField: "proxy_id",
            foreignField: "_id",
            as: "proxy",
          },
        },
        { $unwind: { path: "$proxy", preserveNullAndEmptyArrays: true } },
        {
          $match: {
            "proxy.is_deleted": { $ne: false }, // ✅ exclude deleted proxies
          },
        },
        // ✅ ADD THIS
        {
          $addFields: {
            user_first_name: { $ifNull: ["$user.first_name", ""] },
            user_email: { $ifNull: ["$user.email", ""] },
            query_params: { $ifNull: ["$proxy.query_params", ""] },
          },
        },

        ...(search ? [{ $match: searchMatch }] : []),

        // ✅ UPDATED SORT
        {
          $sort: {
            [finalSortField]: sortOrder === "asc" ? 1 : -1,
          },
        },

        { $skip: skip },
        { $limit: Number(limit) },
      ];

      const countPipeline = [
        { $match: match },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        ...(search ? [{ $match: searchMatch }] : []),
        { $count: "total" },
      ];

      const [data, countResult] = await Promise.all([
        AliasKeyModel.aggregate(pipeline),
        AliasKeyModel.aggregate(countPipeline),
      ]);

      const total = countResult[0]?.total || 0;
      //fetch history
      // 🔥 Get active alias IDs
      const activeAliasIds = data
        .filter(
          (item) =>
            item.key_status === "Active" || item.key_status === "Inactive",
        )
        .map((item) => item._id);

      // 🔥 Default stats (used everywhere)
      const defaultStats = {
        total_history_records: 0,
        total_success: 0,
        total_limit_exceed: 0,
        total_internal_server: 0,
        total_key_not_active: 0,
        total_extrenal_error: 0,
        total_invalid_proxy: 0,
        total_invalid_params: 0,
      };

      // 🔥 Fetch stats ONLY if active aliases exist
      let stats: any[] = [];

      if (activeAliasIds.length > 0) {
        stats = await ApiHistoryModel.aggregate([
          {
            $match: {
              user_alias_key_id: { $in: activeAliasIds },
            },
          },
          {
            $group: {
              _id: "$user_alias_key_id",

              total_history_records: { $sum: 1 },

              total_success: {
                $sum: {
                  $cond: [{ $eq: ["$response_code_str", "SUCCESS"] }, 1, 0],
                },
              },

              total_limit_exceed: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "LIMIT_EXCEED"] },
                    1,
                    0,
                  ],
                },
              },

              total_internal_server: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "INTERNAL_SERVER"] }, // ⚠️ check typo
                    1,
                    0,
                  ],
                },
              },

              total_key_not_active: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "KEY_NOT_ACTIVE"] },
                    1,
                    0,
                  ],
                },
              },
              total_extrenal_error: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "EXTERNAL_ERROR"] },
                    1,
                    0,
                  ],
                },
              },
              total_invalid_proxy: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "INVALID_PROXY"] },
                    1,
                    0,
                  ],
                },
              },
              total_invalid_params: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "PARAM_MISSING"] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]);
      }

      // 🔥 Convert to map for O(1) lookup
      const statsMap: Record<string, any> = {};

      for (const item of stats) {
        const key = String(item._id);
        statsMap[key] = item;
      }

      // 🔥 Merge stats into paginated data
      const finalData = data.map((item) => {
        // ❌ If not active → return default stats
        if (!(item.key_status === "Active" || item.key_status === "Inactive")) {
          return {
            ...item,
            ...defaultStats,
          };
        }

        const stat = statsMap[String(item._id)] || defaultStats;

        return {
          ...item,
          ...defaultStats, // ensures all fields exist
          ...stat, // overwrite with actual values if present
        };
      });
      //end fetch

      res.status(200).json({
        success: true,
        data: finalData,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };
  // ✅ GET LIST (pagination + search)
  getDatas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = ((req.query.search as string) || "").trim();
      const key_statusFilter = req.query.key_status as string;
      const approval_statusFilter = req.query.approval_status as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const sortBy = req.query.sortBy as string;
      const sortField = req.query.sortField as string;
      const sortOrder = req.query.sortOrder as string;
      const finalSortBy = (sortBy || sortField || "createdAt") as string;
      if (![UserType.ADMIN, UserType.USER].includes(req.user.role)) {
        throw new ApiError("You are not allowed access", 403);
      }

      const skip = (Number(page) - 1) * Number(limit);

      // 🔥 Base match
      const match: any = {};
      if (
        key_statusFilter &&
        ["Active", "Inactive"].includes(key_statusFilter)
      ) {
        match.key_status = key_statusFilter;
      }
      if (approval_statusFilter) {
        match.approval_status = approval_statusFilter;
      }

      // 🔥 Add date range filter
      if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) {
          match.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          // Set to end of day
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          match.createdAt.$lte = end;
        }
      }
      if (req.user.role === UserType.USER) {
        match.user_id = new Types.ObjectId(req.user.id);
      }
      const sortMap: any = {
        "user.first_name": "user_first_name",
        "user.email": "user_email",
      };

      const finalSortField = sortMap[finalSortBy] || finalSortBy; // 🔥 Search condition
      const searchMatch = search
        ? {
            $or: [
              { alias_key: { $regex: search, $options: "i" } },
              { domain_name: { $regex: search, $options: "i" } },
              { key_status: { $regex: search, $options: "i" } },
              { "user.first_name": { $regex: search, $options: "i" } },
              { "user.email": { $regex: search, $options: "i" } },

              // ✅ numeric search (partial match)
              {
                $expr: {
                  $regexMatch: {
                    input: { $toString: "$total_quota" },
                    regex: search,
                    options: "i",
                  },
                },
              },
            ],
          }
        : {};

      const pipeline: any[] = [
        { $match: match },

        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

        {
          $lookup: {
            from: "proxies",
            localField: "proxy_id",
            foreignField: "_id",
            as: "proxy",
          },
        },
        { $unwind: { path: "$proxy", preserveNullAndEmptyArrays: true } },
      ];

      // ✅ Role-based filter
      if (req.user.role === UserType.USER) {
        pipeline.push({
          $match: {
            "proxy.is_deleted": { $ne: true },
          },
        });
      }

      // ✅ Continue pipeline properly
      pipeline.push({
        $addFields: {
          user_first_name: { $ifNull: ["$user.first_name", ""] },
          user_email: { $ifNull: ["$user.email", ""] },
          query_params: { $ifNull: ["$proxy.query_params", ""] },
        },
      });

      // ✅ Add search separately
      if (search) {
        pipeline.push({ $match: searchMatch });
      }

      // ✅ Add remaining stages
      pipeline.push(
        {
          $sort: {
            [finalSortField]: sortOrder === "asc" ? 1 : -1,
          },
        },
        { $skip: skip },
        { $limit: Number(limit) },
      );

      const countPipeline = [
        { $match: match },

        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

        {
          $lookup: {
            from: "proxies",
            localField: "proxy_id",
            foreignField: "_id",
            as: "proxy",
          },
        },
        { $unwind: { path: "$proxy", preserveNullAndEmptyArrays: true } },

        ...(req.user.role === UserType.USER
          ? [{ $match: { "proxy.is_deleted": { $ne: true } } }]
          : []),

        ...(search ? [{ $match: searchMatch }] : []),

        { $count: "total" },
      ];

      const [data, countResult] = await Promise.all([
        AliasKeyModel.aggregate(pipeline),
        AliasKeyModel.aggregate(countPipeline),
      ]);

      const total = countResult[0]?.total || 0;
      //fetch history
      // 🔥 Get active alias IDs
      const activeAliasIds = data
        .filter(
          (item) =>
            item.key_status === "Active" || item.key_status === "Inactive",
        )
        .map((item) => item._id);

      // 🔥 Default stats (used everywhere)
      const defaultStats = {
        total_history_records: 0,
        total_success: 0,
        total_limit_exceed: 0,
        total_internal_server: 0,
        total_key_not_active: 0,
        total_extrenal_error: 0,
        total_invalid_proxy: 0,
        total_invalid_params: 0,
      };

      // 🔥 Fetch stats ONLY if active aliases exist
      let stats: any[] = [];

      if (activeAliasIds.length > 0) {
        stats = await ApiHistoryModel.aggregate([
          {
            $match: {
              user_alias_key_id: { $in: activeAliasIds },
            },
          },
          {
            $group: {
              _id: "$user_alias_key_id",

              total_history_records: { $sum: 1 },

              total_success: {
                $sum: {
                  $cond: [{ $eq: ["$response_code_str", "SUCCESS"] }, 1, 0],
                },
              },

              total_limit_exceed: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "LIMIT_EXCEED"] },
                    1,
                    0,
                  ],
                },
              },

              total_internal_server: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "INTERNAL_SERVER"] }, // ⚠️ check typo
                    1,
                    0,
                  ],
                },
              },

              total_key_not_active: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "KEY_NOT_ACTIVE"] },
                    1,
                    0,
                  ],
                },
              },
              total_extrenal_error: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "EXTERNAL_ERROR"] },
                    1,
                    0,
                  ],
                },
              },
              total_invalid_proxy: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "INVALID_PROXY"] },
                    1,
                    0,
                  ],
                },
              },
              total_invalid_params: {
                $sum: {
                  $cond: [
                    { $eq: ["$response_code_str", "PARAM_MISSING"] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]);
      }

      // 🔥 Convert to map for O(1) lookup
      const statsMap: Record<string, any> = {};

      for (const item of stats) {
        const key = String(item._id);
        statsMap[key] = item;
      }

      // 🔥 Merge stats into paginated data
      const finalData = data.map((item) => {
        // ❌ If not active → return default stats
        if (!(item.key_status === "Active" || item.key_status === "Inactive")) {
          return {
            ...item,
            ...defaultStats,
          };
        }

        const stat = statsMap[String(item._id)] || defaultStats;

        return {
          ...item,
          ...defaultStats, // ensures all fields exist
          ...stat, // overwrite with actual values if present
        };
      });
      //end fetch

      res.status(200).json({
        success: true,
        data: finalData,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ UPDATE
  updateData = async (
    req: Request<{ id: string }, {}, Partial<IUserAliasKey>>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid ID" });
        return;
      }

      const data = await AliasKeyModel.findByIdAndUpdate(
        id,
        {
          domain_name: req.body.domain_name,
          description: req.body.description,
          cost_calculation: req.body.cost_calculation,
        },
        {
          new: true,
        },
      );

      if (!data) {
        res.status(404).json({
          success: false,
          message: `${msgTitle} not found`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `${msgTitle} updated successfully`,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ DELETE
  deleteData = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid ID" });
        return;
      }

      const data = await AliasKeyModel.findByIdAndDelete(id);

      if (!data) {
        res.status(404).json({
          success: false,
          message: `${msgTitle} not found`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `${msgTitle} deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  };
  changeRequest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id, action, rejection_reason } = req.body;

      const existing = await AliasKeyModel.findById(id);

      if (!existing) {
        throw new Error("Alias key not found");
      }

      // ✅ Only allow once
      if (existing.approval_status !== "Pending") {
        throw new Error("Action already performed");
      }

      let updateData: any = {};

      if (action === "Approved") {
        const aliasKey = await this.generateUniqueAliasKey();

        updateData = {
          alias_key: aliasKey,
          approval_status: "Approved",
          remaining_quota: existing.total_quota, // ✅ IMPORTANT LINE
        };
      } else if (action === "Rejected") {
        updateData = {
          approval_status: "Rejected",
          rejection_reason: rejection_reason,
        };
      }

      const updated = await AliasKeyModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true },
      );

      // Update Redis cache if alias_key exists
      // if (updated && updated.alias_key && action === "Active") {
      //   await redisClient.setEx(
      //     `alias_key:${updated.alias_key}`,
      //     300,
      //     JSON.stringify(updated),
      //   );
      // }

      res.status(200).json({
        success: true,
        message: `Alias key ${
          action === "Approved" ? "activated" : "rejected"
        } successfully`,
        data: updated, // optional but useful
      });
    } catch (error) {
      next(error);
    }
  };
  makeActiveInactive = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.body;

      const existing = await AliasKeyModel.findById(id);

      if (!existing) {
        throw new Error("Alias key not found");
      }

      // ✅ Only allow toggle between Active & Inactive
      if (!["Active", "Inactive"].includes(existing.key_status)) {
        throw new Error("Only Active/Inactive status can be toggled");
      }

      // 🔥 Toggle logic
      const newStatus =
        existing.key_status === "Active" ? "Inactive" : "Active";

      const updated = await AliasKeyModel.findByIdAndUpdate(
        id,
        { $set: { key_status: newStatus } },
        { new: true },
      );

      res.status(200).json({
        success: true,
        message: `Alias key ${
          newStatus === "Active" ? "activated" : "inactivated"
        } successfully`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };
  generateUniqueAliasKey = async (): Promise<string> => {
    let key;
    let exists = true;

    while (exists) {
      key = generateAliasKey();
      const found = await AliasKeyModel.findOne({ alias_key: key });
      if (!found) exists = false;
    }

    return key!;
  };
}

export const aliasKeyController = new AliasKeyController();
