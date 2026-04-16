import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

import ApiHistoryModel from "../models/apiHistory.model";
import AliasKeyModel from "../models/aliasKey.model";

interface AuthRequest extends Request {
  user?: any;
}
class ApiHistoryController {
  getApiHistory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.user;

      // ✅ Query params
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = ((req.query.search as string) || "").trim();

      // ✅ FIXED: match frontend params
      const sortFieldRaw = req.query.sortField as string;
      const sortOrderRaw = req.query.sortOrder as string;

      // ✅ Allowed sort fields (important for safety)
      const allowedSortFields = [
        "createdAt",
        "execution_time",
        "method",
        "_id",
        "response_status",
        "response_msg",
        "response_status_code",
        "alias.alias_key",
      ];

      let sortField = "createdAt";

      if (allowedSortFields.includes(sortFieldRaw)) {
        if (sortFieldRaw === "alias.alias_key") {
          sortField = "alias_key"; // ✅ use flattened field
        } else {
          sortField = sortFieldRaw;
        }
      }

      const sortOrder = sortOrderRaw === "asc" ? 1 : -1;
      const aliasKeyFilter = req.query.alias_key as string;
      const userFilter = req.query.user as string;
      const skip = (page - 1) * limit;

      // 🔐 Base match
      const match: any = {};

      // ✅ User restriction
      if (user.role !== "Admin") {
        match.user_id = new Types.ObjectId(user._id);
      }

      // ✅ Alias filter
      if (aliasKeyFilter) {
        match.user_alias_key_id = new Types.ObjectId(aliasKeyFilter);
      }

      if (
        user.role === "Admin" &&
        userFilter &&
        Types.ObjectId.isValid(userFilter)
      ) {
        match.user_id = new Types.ObjectId(userFilter);
      }

      const selectFields =
        "user_alias_key_id method execution_time response_status response_msg response_code request_params createdAt";
      let data: any[] = [];
      let total = 0;

      const needsAliasAggregation = sortField === "alias_key" || !!search;

      // Separate base conditions from search conditions
      const baseQuery: any = { ...match };
      let searchQuery: any = {};

      if (search) {
        const numericSearch =
          !Number.isNaN(Number(search)) && search.trim() !== "";
        const searchConditions: any[] = [
          { method: { $regex: search, $options: "i" } },
          { response_msg: { $regex: search, $options: "i" } },
          { response_status: { $regex: search, $options: "i" } },
          { execution_time: { $regex: search, $options: "i" } },
        ];

        // Only add response_code search if it's a numeric search
        if (numericSearch) {
          searchConditions.push({ response_code: Number(search) });
        }

        // Add alias key search only when we have the join (in aggregation)
        if (needsAliasAggregation) {
          searchConditions.push({
            "alias.alias_key": { $regex: search, $options: "i" },
          });
        }

        searchQuery = { $or: searchConditions };
      }

      // For non-aggregation case, combine base and search queries
      const query: any = search ? { ...baseQuery, ...searchQuery } : baseQuery;
      if (!needsAliasAggregation) {
        const [rows, count] = await Promise.all([
          ApiHistoryModel.find(query)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit)
            .select(selectFields)
            .populate({ path: "user_alias_key_id", select: "alias_key" })
            .lean(),
          ApiHistoryModel.countDocuments(query),
        ]);

        data = rows.map((row: any) => ({
          ...row,
          alias: {
            alias_key: row.user_alias_key_id?.alias_key || "",
          },
        }));
        total = count;
      } else {
        const lookupPipeline = [
          {
            $lookup: {
              from: "alias_keys",
              localField: "user_alias_key_id",
              foreignField: "_id",
              as: "alias",
            },
          },
          { $unwind: { path: "$alias", preserveNullAndEmptyArrays: true } },
        ];

        const aggregationPipeline: any[] = [
          { $match: baseQuery }, // Base conditions first
          ...lookupPipeline, // Then join
          ...(search ? [{ $match: searchQuery }] : []), // Then search (if any)
          {
            $addFields: {
              alias_key: "$alias.alias_key",
            },
          },
          {
            $sort: {
              [sortField]: sortOrder,
            },
          },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              user_alias_key_id: 1,
              method: 1,
              execution_time: 1,
              response_status: 1,
              response_msg: 1,
              response_code: 1,
              createdAt: 1,
              alias: {
                alias_key: "$alias.alias_key",
              },
            },
          },
        ];

        const countPipeline: any[] = [
          { $match: baseQuery }, // Base conditions first
          ...lookupPipeline, // Then join
          ...(search ? [{ $match: searchQuery }] : []), // Then search (if any)
          { $count: "total" },
        ];

        const [rows, countResult] = await Promise.all([
          ApiHistoryModel.aggregate(aggregationPipeline),
          ApiHistoryModel.aggregate(countPipeline),
        ]);

        data = rows;
        total = countResult[0]?.total || 0;
      }

      // 🔽 Alias dropdown
      let aliasKeys = [];

      if (user.role === "Admin") {
        aliasKeys = await AliasKeyModel.find({ status: "Active" })
          .select("_id alias_key")
          .lean();
      } else {
        aliasKeys = await AliasKeyModel.find({
          status: "Active",
          user_id: user._id,
        })
          .select("_id alias_key")
          .lean();
      }

      // ✅ Response
      res.status(200).json({
        success: true,
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        aliasKeysList: aliasKeys,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const apiHistoryController = new ApiHistoryController();
