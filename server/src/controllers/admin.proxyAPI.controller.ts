import { Request, Response, NextFunction } from "express";
import { userService } from "../services/admin.user.service";
import IUser, { GetUsersQuery } from "../interface/user.interface";
import { Types } from "mongoose";
import ApiError from "../utils/api.error";
import AliasKeyModel from "../models/aliasKey.model";
import ApiHistoryModel from "../models/apiHistory.model";

class ProxyController {
  handleResponse = async (
    res: Response,
    user_id: Types.ObjectId | null,
    alias_key_id: Types.ObjectId | null,
    method: string,
    startTime: number,
    response_status: string,
    response_msg: string,
    response_code: number,
    response_code_str: string,
  ) => {
    const execTime = Date.now() - startTime;

    ApiHistoryModel.create({
      user_id: user_id,
      user_alias_key_id: alias_key_id,
      method: method,
      execution_time: execTime,
      response_status: response_status,
      response_msg: response_msg,
      response_code: response_code,
      response_code_str: response_code_str,
    }).catch((err) => {
      console.error("❌ Logging failed:", err.message);
    });

    return res.status(response_code).json({
      status: response_status,
      message: response_msg,
      execution_time: `${execTime}ms`,
    });
  };
  getProxyResponse = async (req: Request, res: Response): Promise<any> => {
    const startTime = Date.now();
    const alias_key = req.query.alias_key || req.body.alias_key;

    // Early validation
    if (!alias_key) {
      return res.status(400).json({
        status: "fail",
        message: "Alias key not exist",
      });
    }

    try {
      // Single optimized query: try to find and update in one go
      const aliasKey = await AliasKeyModel.findOneAndUpdate(
        {
          alias_key,
          status: "Active",
          remaining_quota: { $gt: 0 },
        },
        { $inc: { remaining_quota: -1 } },
        { new: true },
      );

      // Success case
      if (aliasKey) {
        return this.handleResponse(
          res,
          aliasKey.user_id,
          aliasKey._id,
          req.method,
          startTime,
          "success",
          "Api call success",
          200,
          "SUCCESS",
        );
      }

      // Key not found or conditions not met - check why
      const existingKey = await AliasKeyModel.findOne({ alias_key });

      // Key doesn't exist at all
      if (!existingKey) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid alias key",
        });
      }

      // Key exists but has issues - determine which one
      let response_code: number;
      let response_code_str: string;
      let response_msg: string;

      if (existingKey.status !== "Active") {
        response_code = 403;
        response_code_str = "KEY_NOT_ACTIVE";
        response_msg = "Alias key is not active";
      } else if (existingKey.remaining_quota <= 0) {
        response_code = 429;
        response_code_str = "LIMIT_EXCEED";
        response_msg = "Alias key limit exceed";
      } else {
        // Fallback for any other edge case
        response_code = 400;
        response_code_str = "INTERNAL_SEREVER";
        response_msg = "Something went wrong";
      }

      return this.handleResponse(
        res,
        existingKey.user_id,
        existingKey._id,
        req.method,
        startTime,
        "fail",
        response_msg,
        response_code,
        response_code_str,
      );
    } catch (error) {
      // Error case
      return this.handleResponse(
        res,
        null,
        null,
        req.method,
        startTime,
        "fail",
        "Internal server error",
        500,
        "INTERNAL_SERVER",
      );
    }
  };
}
export const proxyController = new ProxyController();
