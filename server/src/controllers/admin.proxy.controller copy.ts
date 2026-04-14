import { Request, Response, NextFunction } from "express";
import { userService } from "../services/admin.user.service";
import IUser, { GetUsersQuery } from "../interface/user.interface";
import { Types } from "mongoose";
import ApiError from "../utils/api.error";
import AliasKeyModel from "../models/aliasKey.model";
import { apiLogQueue } from "../config/queue";

class ProxyController {
  handleResponse = async (
    req: Request,
    res: Response,
    user_id: Types.ObjectId | null,
    alias_key_id: Types.ObjectId | null,
    startTime: number,
    response_status: "success" | "fail" | "error",
    response_msg: string,
    response_status_code: number,
  ) => {
    const execTime = Date.now() - startTime;

    // 🚀 Add to queue instead of directly creating
    apiLogQueue
      .add(
        "log-api-history",
        {
          user_id,
          user_alias_key_id: alias_key_id,
          method: req.method,
          origin_url: req.originalUrl,
          execution_time: execTime,
          response_status,
          response_msg,
          response_status_code,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
        },
      )
      .catch((err) => {
        console.error("❌ Failed to enqueue log:", err.message);
      });

    return res.status(response_status_code).json({
      status: response_status,
      message: response_msg,
      execution_time: `${execTime}ms`,
    });
  };
  getProxyResponse = async (req: Request, res: Response): Promise<any> => {
    const startTime = Date.now();
    let error_code: number = 200;
    const alias_key = req.query.alias_key || req.body.alias_key;
    if (!alias_key) {
      return res.status(400).json({
        status: "fail",
        message: "Alias key not exist",
      });
    }

    try {
      const aliasKey = await AliasKeyModel.findOneAndUpdate(
        {
          alias_key,
          status: "Active",
          remaining_quota: { $gt: 0 },
        },
        { $inc: { remaining_quota: -1 } },
        { new: true },
      );

      // ✅ SUCCESS (LOG)
      if (aliasKey) {
        return this.handleResponse(
          req,
          res,
          aliasKey.user_id,
          aliasKey._id,

          startTime,
          "success",
          "Api call success",
          error_code,
        );
      }

      const existing = await AliasKeyModel.findOne({ alias_key });

      // ❌ DO NOT LOG
      if (!existing) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid alias key",
        });
      }

      // ✅ HANDLE FAILURE CASES (LOG)
      let message = "Something went wrong";

      if (existing.status !== "Active") {
        error_code = 403;
        message = "Alias key is not active";
      } else if (existing.remaining_quota <= 0) {
        error_code = 429;
        message = "Alias key limit exceed";
      }

      return this.handleResponse(
        req,
        res,
        existing.user_id,
        existing._id,

        startTime,
        "fail",
        message,
        error_code,
      );
    } catch (error) {
      // ✅ ERROR (LOG)
      return this.handleResponse(
        req,
        res,
        null,
        null,
        startTime,
        "fail",
        "Internal server error",
        500,
      );
    }
  };
}
export const proxyController = new ProxyController();
