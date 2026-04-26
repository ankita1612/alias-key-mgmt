import { Request, Response, NextFunction } from "express";
import { IAliasKeyLog } from "../interface/IAliasKeyLog.interface";
import ApiError from "../utils/api.error";
import { Types } from "mongoose";
const msgTitle = "Key";
import { UserType } from "../interface/user.interface";
import ApiHistoryModel from "../models/apiHistory.model";
import { AliasKeyLogModel } from "../models/aliasKeyLog.model";
//import redisClient from "../config/redis.config";
//import IUser from "../interface/IUserAliasKey.interface";

class AliasKeyLogController {
  // ✅ CREATE
  addData = async (
    req: Request<{}, {}, IAliasKeyLog>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { alias_id, history } = req.body;

      if (!Types.ObjectId.isValid(alias_id)) {
        res.status(400).json({ success: false, message: "Invalid alias_id" });
        return;
      }

      const result = await AliasKeyLogModel.create({
        alias_id,
        history,
        user_id: req.user.id, // ✅ from auth middleware
      });

      res.status(201).json({
        success: true,
        message: "Alias key log created successfully",
        result,
      });
    } catch (error) {
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

      const logs = await AliasKeyLogModel.find({ alias_id: id })
        .sort({ createdAt: -1, _id: -1 })
        .populate("alias_id", "alias_key domain_name")
        .populate("user_id", "first_name email");

      // if (!logs.length) {
      //   res.status(404).json({
      //     success: false,
      //     message: "No logs found",
      //   });
      //   return;
      // }

      res.status(200).json({
        success: true,
        data: logs,
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
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const aliasId = req.query.alias_id as string;

      const sortField = (req.query.sortField as string) || "created_date";
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

      const skip = (page - 1) * limit;

      // 🔥 Base match
      const match: any = {};

      if (aliasId && Types.ObjectId.isValid(aliasId)) {
        match.alias_id = new Types.ObjectId(aliasId);
      }

      if (req.user.role === UserType.USER) {
        match.user_id = new Types.ObjectId(req.user.id);
      }

      // 🔥 Date filter
      if (startDate || endDate) {
        match.created_date = {};
        if (startDate) match.created_date.$gte = new Date(startDate);

        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          match.created_date.$lte = end;
        }
      }

      // 🔍 Search (only history text)
      if (search) {
        match.history = { $regex: search, $options: "i" };
      }

      const pipeline: any[] = [
        { $match: match },

        {
          $lookup: {
            from: "aliaskeys",
            localField: "alias_id",
            foreignField: "_id",
            as: "alias",
          },
        },
        { $unwind: { path: "$alias", preserveNullAndEmptyArrays: true } },

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
          $sort: { [sortField]: sortOrder },
        },
        { $skip: skip },
        { $limit: limit },
      ];

      const countPipeline = [{ $match: match }, { $count: "total" }];

      const [data, countResult] = await Promise.all([
        AliasKeyLogModel.aggregate(pipeline),
        AliasKeyLogModel.aggregate(countPipeline),
      ]);

      const total = countResult[0]?.total || 0;

      res.status(200).json({
        success: true,
        data,
        pagination: {
          total,
          page,
          limit,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const aliasKeyLogController = new AliasKeyLogController();
