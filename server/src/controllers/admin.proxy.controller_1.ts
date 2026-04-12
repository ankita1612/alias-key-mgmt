import { Request, Response } from "express";
import AliasKeyModel from "../models/aliasKey.model";
import redisClient from "../config/redis.config";
import { apiLogQueue } from "../queues/apiLog.queue";

class ProxyController {
  
  handleResponse = async (
    req: Request,
    res: Response,
    user_id: any,
    alias_key_id: any,
    response: any,
    startTime: number,
    statusCode: number
  ) => {
    const execTime = Date.now() - startTime;

    // ✅ PUSH TO QUEUE (NON-BLOCKING)
    await apiLogQueue.add("log", {
      user_id,
      user_alias_key_id: alias_key_id,
      request_info: {
        method: req.method,
        url: req.originalUrl,
      },
      response,
      execution_time: `${execTime}ms`,
      status: response.success ? "Success" : "Fail",
    });

    return res.status(statusCode).json({
      ...response,
      execution_time: `${execTime}ms`,
    });
  };

  getProxyResponse = async (req: Request, res: Response): Promise<any> => {
    const alias_key = req.query.alias_key || req.body.alias_key;

    if (!alias_key) {
      return res.status(400).json({
        success: false,
        message: "Alias key not exist",
      });
    }

    const startTime = Date.now();
    const cacheKey = `alias:${alias_key}`;

    try {
      // ✅ 1. CHECK REDIS CACHE
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached);

        return this.handleResponse(
          req,
          res,
          parsed.user_id,
          parsed.alias_key_id,
          parsed.response,
          startTime,
          200
        );
      }

      // ✅ 2. DB HIT ONLY IF CACHE MISS
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
        const response = {
          success: true,
          message: "Api call success",
        };

        // ✅ 3. STORE IN REDIS (SHORT TTL)
        await redisClient.set(
          cacheKey,
          JSON.stringify({
            user_id: aliasKey.user_id,
            alias_key_id: aliasKey._id,
            response,
          }),
          "EX",
          30 // 30 sec cache (tune as needed)
        );

        return this.handleResponse(
          req,
          res,
          aliasKey.user_id,
          aliasKey._id,
          response,
          startTime,
          200
        );
      }

      // ❌ HANDLE FAIL CASE
      const existing = await AliasKeyModel.findOne({ alias_key });

      if (!existing) {
        return res.status(400).json({
          success: false,
          message: "Invalid alias key",
        });
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
        { success: false, message },
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