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
    if (!alias_key) {
      return res.status(400).json({
        status: "fail",
        message: "Alias key not exist",
      });
    }
    const method = req.method;
    let response_code: number = 200;
    let response_msg = "Api call success";
    let response_code_str = "SUCCESS";
    let response_status = "success";

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
          res,
          aliasKey.user_id,
          aliasKey._id,
          method,
          startTime,
          response_status,
          response_msg,
          response_code,
          response_code_str,
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

      if (existing.status !== "Active") {
        response_status = "fail";
        response_code = 403;
        response_code_str = "KEY_NOT_ACTIVE";
        response_msg = "Alias key is not active";
      } else if (existing.remaining_quota <= 0) {
        response_code = 429;
        response_status = "fail";
        response_code_str = "LIMIT_EXCEED";
        response_msg = "Alias key limit exceed";
      }

      return this.handleResponse(
        res,
        existing.user_id,
        existing._id,
        method,
        startTime,
        response_status,
        response_msg,
        response_code,
        response_code_str,
      );
    } catch (error) {
      // ✅ ERROR (LOG)
      return this.handleResponse(
        res,
        null,
        null,
        method,
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
