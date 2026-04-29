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
}

export const aliasKeyLogController = new AliasKeyLogController();
