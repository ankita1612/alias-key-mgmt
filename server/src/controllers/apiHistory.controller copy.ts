import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/api.error";
import { Types } from "mongoose";

import ApiHistoryModel from "../models/apiHistory.model";
import User from "../models/user.model";
import AliasKeyModel from "../models/aliasKey.model";
class ApiHistoryController {
  getApiHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      // ✅ Query params
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const sortBy = (req.query.sortBy as string) || "createdAt";
      const order = (req.query.order as string) === "asc" ? 1 : -1;
      const userFilter = req.query.user as string;
      const aliasKeyFilter = req.query.alias_key as string;

      const skip = (page - 1) * limit;

      // 🔐 Base match
      const match: any = {};

      if (user.role !== "Admin") {
        match.user_id = new Types.ObjectId(user._id);
      }

      if (userFilter) {
        match.user_id = new Types.ObjectId(userFilter);
      }

      if (aliasKeyFilter) {
        match.user_alias_key_id = new Types.ObjectId(aliasKeyFilter);
      }

      // 🔥 Sort mapping (for nested fields)
      const sortMap: any = {
        "user.first_name": "user_first_name",
        "user.email": "user_email",
        "alias.alias_key": "alias_key_name",
      };

      const finalSortField = sortMap[sortBy] || sortBy;

      // 🔍 Search condition
      const searchMatch = search
        ? {
            $or: [
              { "request_info.url": { $regex: search, $options: "i" } },
              { "request_info.method": { $regex: search, $options: "i" } },
              { status: { $regex: search, $options: "i" } },
              { "user.first_name": { $regex: search, $options: "i" } },
              { "user.email": { $regex: search, $options: "i" } },
              { "alias.alias_key": { $regex: search, $options: "i" } },
            ],
          }
        : {};

      // 🔥 MAIN PIPELINE
      const pipeline: any[] = [
        { $match: match },

        // 👤 Join user
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

        // 🔑 Join alias key
        {
          $lookup: {
            from: "alias_keys",
            localField: "user_alias_key_id",
            foreignField: "_id",
            as: "alias",
          },
        },
        { $unwind: { path: "$alias", preserveNullAndEmptyArrays: true } },

        // ✅ Add flat fields for sorting
        {
          $addFields: {
            user_first_name: { $ifNull: ["$user.first_name", ""] },
            user_email: { $ifNull: ["$user.email", ""] },
            alias_key_name: { $ifNull: ["$alias.alias_key", ""] },
          },
        },

        ...(search ? [{ $match: searchMatch }] : []),

        // 🔥 Sorting
        {
          $sort: {
            [finalSortField]: order,
          },
        },

        // 📄 Pagination
        { $skip: skip },
        { $limit: limit },
      ];

      // 🔥 COUNT PIPELINE
      const countPipeline: any[] = [
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
            from: "alias_keys",
            localField: "user_alias_key_id",
            foreignField: "_id",
            as: "alias",
          },
        },
        { $unwind: { path: "$alias", preserveNullAndEmptyArrays: true } },

        ...(search ? [{ $match: searchMatch }] : []),

        { $count: "total" },
      ];

      // 🚀 Execute
      const [data, countResult] = await Promise.all([
        ApiHistoryModel.aggregate(pipeline),
        ApiHistoryModel.aggregate(countPipeline),
      ]);

      const total = countResult[0]?.total || 0;

      // 🔽 Dropdown data
      let users = [];
      let aliasKeys = [];

      if (req.user.role === "Admin") {
        [users, aliasKeys] = await Promise.all([
          User.find({ role: "User" }).select("_id first_name").lean(),

          AliasKeyModel.find({ status: "Active" })
            .select("_id alias_key")
            .lean(),
        ]);
      } else {
        // USER role
        aliasKeys = await AliasKeyModel.find({
          status: "Active",
          user_id: req.user._id, // 🔥 important
        })
          .select("_id alias_key")
          .lean();
      }
      res.status(200).json({
        success: true,
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        usersList: users,
        aliasKeysList: aliasKeys,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const apiHistoryController = new ApiHistoryController();
