import { Request, Response, NextFunction } from "express";
import IUser, { IUserAliasKey } from "../interface/IAliasKey.interface";
import ApiError from "../utils/api.error";
import { Types } from "mongoose";
const msgTitle = "Alias key";
import { UserType } from "../interface/user.interface";

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

      const result = await AliasKeyModel.create({
        user_id: userId,
        domain: data.domain,
        status: "Pending",
        total_quota: data.total_quota,
        description: data.description,
      });

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

  // ✅ GET LIST (pagination + search)
  getDatas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        search = "",
        page = "1",
        limit = "10",
        sortBy,
        sortField,
        sortOrder = "desc",
      } = req.query;
      const finalSortBy = (sortBy || sortField || "createdAt") as string;
      if (![UserType.ADMIN, UserType.USER].includes(req.user.role)) {
        throw new ApiError("You are not allowed access", 403);
      }

      const skip = (Number(page) - 1) * Number(limit);

      // 🔥 Base match
      const match: any = {};

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
              { domain: { $regex: search, $options: "i" } },
              { status: { $regex: search, $options: "i" } },
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

        // ✅ ADD THIS
        {
          $addFields: {
            user_first_name: { $ifNull: ["$user.first_name", ""] },
            user_email: { $ifNull: ["$user.email", ""] },
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

      res.status(200).json({
        success: true,
        data,
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
          domain: req.body.domain,
          description: req.body.description,
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
      const { id, action } = req.body;

      const existing = await AliasKeyModel.findById(id);

      if (!existing) {
        throw new Error("Alias key not found");
      }

      // ✅ Only allow once
      if (existing.status !== "Pending") {
        throw new Error("Action already performed");
      }

      let updateData: any = {};

      if (action === "Active") {
        const aliasKey = await this.generateUniqueAliasKey();

        updateData = {
          alias_key: aliasKey,
          status: "Active",
          remaining_quota: existing.total_quota, // ✅ IMPORTANT LINE
        };
      } else if (action === "Rejected") {
        updateData = {
          status: "Rejected",
        };
      }

      const updated = await AliasKeyModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true },
      );
      res.json(updated);
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
          action === "Active" ? "activated" : "rejected"
        } successfully`,
        data: updated, // optional but useful
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
