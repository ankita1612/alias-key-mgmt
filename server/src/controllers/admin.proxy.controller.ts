import { Request, Response, NextFunction } from "express";
import { userService } from "../services/admin.user.service";
import IUser, { GetUsersQuery } from "../interface/user.interface";
import { Types } from "mongoose";
import ApiError from "../utils/api.error";
import { AliasKeyModel } from "../models/aliasKey.model";
import ApiHistoryModel from "../models/apiHistory.model" 
import { json } from "node:stream/consumers";
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
 getProxyResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();

  try {
    // ✅ 1. Extract alias key (GET / POST)
    const alias_key =
      req.method === "GET"
        ? (req.query.alias_key as string)
        : req.body.alias_key;
    if (!alias_key) {
      return this.handleResponse(req, res, null, null, {
        success: false,
        message: "Alias key not exist",
      }, startTime, 400);
    }
    const aliasKey = await AliasKeyModel.findOneAndUpdate(
      {
        alias_key:alias_key,
        status: "Active",
        remaining_quota: { $gt: 0 },
      },
      {
        $inc: { remaining_quota: -1 },
      },
      {
        new: true,
      }
    );

    // ❌ If failed → check exact reason
    if (!aliasKey) {
      // Check existence separately (for proper message)
      const existingKey = await AliasKeyModel.findOne({ alias_key });

      let message = "Invalid alias key";

      if (existingKey) {
        if (existingKey.status !== "Active") {
          message = "Alias key is not active";
        } else if (existingKey.remaining_quota <= 0) {
          message = "Alias key limit exceed";
        }
      }

      return this.handleResponse(req, res, existingKey?.user_id, existingKey?._id, {
        success: false,
        message,
      }, startTime, 400);
    }

    // ✅ 6. Success
    return this.handleResponse(
      req,
      res,
      aliasKey.user_id,
      aliasKey._id,
      {
        success: true,
        message: "Api call success",
      },
      startTime,
      200
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
