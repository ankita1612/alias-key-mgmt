import { Request, Response, NextFunction } from "express";
import { userService } from "../services/admin.user.service";
import IUser, { GetUsersQuery } from "../interface/user.interface";
import { Types } from "mongoose";
import ApiError from "../utils/api.error";
import AliasKeyModel from "../models/aliasKey.model";
import ApiHistoryModel from "../models/apiHistory.model";
import redisClient from "../config/redis.config";
class ProxyController {
  
  handleResponse = async (req: Request, res: Response, user_id: any, alias_key_id: any,  response: any,  startTime: number,  statusCode: number) => {
  const execTime = Date.now() - startTime;

  ApiHistoryModel.create({
    user_id,
    user_alias_key_id: alias_key_id,
    request_info: {      method: req.method,      url: req.originalUrl,    },
    response,
    execution_time: `${execTime}ms`, // store number
    status: response.success ? "Success" : "Fail",
  }).catch((err) => {
    console.error("❌ Logging failed:", err);
  });

  return res.status(statusCode).json({
    ...response,
    execution_time: `${execTime}ms`,
  });
};
getProxyResponse = async ( req: Request, res: Response): Promise<any> => {
  const alias_key = req.query.alias_key || req.body.alias_key;
  if (!alias_key) {
    return res.status(400).json({ success: false,  message: "Alias key not exist", });
  }

  const startTime = Date.now();
  try {    
    const aliasKey = await AliasKeyModel.findOneAndUpdate(
      {
        alias_key,
        status: "Active",
        remaining_quota: { $gt: 0 },
      },
      { $inc: { remaining_quota: -1 } },
      { new: true }
    );

    if (aliasKey) {
      return this.handleResponse( req, res,  aliasKey.user_id, aliasKey._id,
        { success: true, message: "Api call success",  },
        startTime,
        200
      );
    }
    
    const existing = await AliasKeyModel.findOne({ alias_key });

    if (!existing) {
      return res.status(400).json({  success: false,  message: "Invalid alias key", });
    }

    let message = "Something went wrong";

    if (existing.status !== "Active") {
      message = "Alias key is not active";
    } else if (existing.remaining_quota <= 0) {
      message = "Alias key limit exceed";
    }

    return this.handleResponse(
      req,
      res,
      existing.user_id,
      existing._id,
      { success: false, message, },
      startTime,
      400
    );

  } catch (error) {
    return this.handleResponse(
      req,
      res,
      null,
      null,
      {
        success: false,
        message: "Internal server error",
      },
      startTime,
      500
    );
  }
};
}
export const proxyController = new ProxyController();
