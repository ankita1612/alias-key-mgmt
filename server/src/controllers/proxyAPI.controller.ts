import { Request, Response } from "express";
import { Types } from "mongoose";
import AliasKeyModel from "../models/aliasKey.model";
import ProxyModel from "../models/proxy.model";
//import { axiosInstance } from "../utils/axiosInstance";
//import { parseCurl } from "../utils/parseCurl";
import axios from "axios";
import http from "http";
import https from "https";
import ApiHistoryModel from "../models/apiHistory.model";

export const axiosInstance = axios.create({
  timeout: 15000,
  httpAgent: new http.Agent({ keepAlive: true, maxSockets: 1000 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 1000 }),
});
type ParsedCurl = {
  method: string;
  url: string;
  headers: Record<string, string>;
  data?: any;
};

export const parseCurl = (curl: string): ParsedCurl => {
  const result: ParsedCurl = {
    method: "GET",
    url: "",
    headers: {},
  };

  // METHOD
  const methodMatch = curl.match(/--request\s+(\w+)/i);
  if (methodMatch) result.method = methodMatch[1].toUpperCase();

  // URL
  const strictUrlMatch = curl.match(/https?:\/\/[^\s'"]+/);

  if (strictUrlMatch) {
    result.url = strictUrlMatch[0];
  } else {
    // fallback (last quoted string)
    const matches = [...curl.matchAll(/'(.*?)'/g)];
    if (matches.length) {
      result.url = matches[matches.length - 1][1];
    }
  }

  // HEADERS
  const headerMatches = [...curl.matchAll(/-H\s+"(.*?)"/g)];
  headerMatches.forEach((h) => {
    const [key, value] = h[1].split(":").map((s) => s.trim());
    result.headers[key] = value;
  });

  // DATA
  const dataMatch = curl.match(/--data\s+'(.*?)'/);
  if (dataMatch) {
    try {
      result.data = JSON.parse(dataMatch[1]);
    } catch {
      result.data = dataMatch[1];
    }
  }

  return result;
};
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
    requestParams: any,
  ) => {
    const execTime = Date.now() - startTime;

    if (user_id && alias_key_id) {
      ApiHistoryModel.create({
        user_id: user_id,
        user_alias_key_id: alias_key_id,
        method: method,
        execution_time: `${execTime} ms`,
        response_status: response_status,
        response_msg: response_msg,
        response_code: response_code,
        response_code_str: response_code_str,
        request_params: requestParams,
      }).catch((err) => {
        console.error("❌ Logging failed:", err.message);
      });
    }

    return res.status(response_code).json({
      status: response_status,
      message: response_msg,
      execution_time: `${execTime}ms`,
    });
  };
  getProxyResponse = async (req: Request, res: Response) => {
    const startTime = Date.now();

    const alias_key = req.query.alias_key || req.body.alias_key;

    if (!alias_key) {
      return res.status(400).json({ message: "Key is required" });
    }

    try {
      // ✅ Merge params (GET + POST support)
      const requestParams = {
        ...req.query,
        ...req.body,
      };
      const allRequestParams = JSON.parse(JSON.stringify(requestParams));

      delete requestParams.alias_key;
      const existingKey = await AliasKeyModel.findOne({ alias_key:alias_key , is_deleted: false }).lean();

      if (!existingKey) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid key",
        });
      }

      // ❌ Inactive
      if (existingKey.key_status !== "Active") {
        return this.handleResponse(
          res,
          existingKey.user_id,
          existingKey._id,
          req.method,
          startTime,
          "fail",
          "Key is inactive",
          403,
          "KEY_NOT_ACTIVE",
          allRequestParams,
        );
      }

      // ✅ Fetch proxy (use lean for performance)
      const proxy = await ProxyModel.findOne({
        _id: existingKey.proxy_id,
        is_deleted: false,
      }).lean();

      if (!proxy) {
        return this.handleResponse(
          res,
          existingKey.user_id,
          existingKey._id,
          req.method,
          startTime,
          "fail",
          "Proxy not found",
          404,
          "INVALID_PROXY",
          allRequestParams,
        );
      }

      const { curl, proxy_token, query_params, curl_token } = proxy;

      // ✅ Validate params (exclude token)
      for (const key of Object.keys(query_params)) {
        if (
          (curl_token && key === curl_token) ||
          (!curl_token && key === "token")
        )
          continue;

        if (!(key in requestParams)) {
          return this.handleResponse(
            res,
            existingKey.user_id,
            existingKey._id,
            req.method,
            startTime,
            "fail",
            `Missing param: ${key}`,
            400,
            "PARAM_MISSING",
            allRequestParams,
          );
        }
      }

      // ✅ Atomic quota decrement before API call
      const quotaUpdate = await AliasKeyModel.updateOne(
        { alias_key, remaining_quota: { $gt: 0 } },
        { $inc: { remaining_quota: -1 } },
      );

      if (quotaUpdate.modifiedCount === 0) {
        return this.handleResponse(
          res,
          existingKey.user_id,
          existingKey._id,
          req.method,
          startTime,
          "fail",
          "Limit exceeded",
          429,
          "LIMIT_EXCEED",
          allRequestParams,
        );
      }

      // ✅ Parse curl (IMPORTANT)
      const parsed = parseCurl(curl);

      // ALWAYS use curl method (NOT req.method)
      const method = parsed.method.toUpperCase();

      let finalUrl = parsed.url;
      let finalData = parsed.data;
      let finalHeaders = { ...parsed.headers };

      // Split URL
      let [baseUrl, existingQuery] = parsed.url.split("?");
      const urlParams = new URLSearchParams(existingQuery || "");

      // ✅ GET
      if (method === "GET") {
        for (const key of Object.keys(query_params)) {
          if (
            (curl_token && key === curl_token) ||
            (!curl_token && key === "token")
          ) {
            urlParams.set(key, proxy_token);
          } else {
            urlParams.set(key, String(requestParams[key]));
          }
        }

        finalUrl = `${baseUrl}?${urlParams.toString()}`;
      }

      // ✅ POST / PUT / PATCH
      else if (method === "POST") {
        let body: any = {};

        if (parsed.data) {
          body =
            typeof parsed.data === "string"
              ? JSON.parse(parsed.data)
              : { ...parsed.data };
        }

        for (const key of Object.keys(query_params)) {
          if (
            (curl_token && key === curl_token) ||
            (!curl_token && key === "token")
          ) {
            body[key] = proxy_token;
          } else {
            body[key] = requestParams[key];
          }
        }

        finalData = body;
        finalUrl = baseUrl;
      }

      let apiResponse;
      // res.json({
      //   method: method,
      //   url: finalUrl,
      //   headers: finalHeaders,
      //   data: finalData,
      // });
      try {
        apiResponse = await axiosInstance.request({
          method,
          url: finalUrl,
          headers: finalHeaders,
          data: ["POST", "PUT", "PATCH"].includes(method)
            ? finalData
            : undefined,
        });
        const creditToAdd = Number(apiResponse?.data?.credit || 0);

        if (creditToAdd > 0) {
          await ProxyModel.updateOne(
            { _id: existingKey.proxy_id },
            { $inc: { credit: creditToAdd } },
          );
        }
        // await ProxyModel.updateOne(
        //   { _id: existingKey.proxy_id },
        //   { $inc: { counter: 1 } },
        // );
        return this.handleResponse(
          res,
          existingKey.user_id,
          existingKey._id,
          req.method,
          startTime,
          "success",
          "Api call success",
          200,
          "SUCCESS",
          allRequestParams,
        );
      } catch (error: any) {
        // ✅ Increment quota back on failure
        await AliasKeyModel.updateOne(
          { alias_key },
          { $inc: { remaining_quota: 1 } },
        );

        // ✅ Axios error handling
        if (error.response) {
          // Server responded with error (4xx, 5xx)
          return this.handleResponse(
            res,
            existingKey.user_id,
            existingKey._id,
            req.method,
            startTime,
            "fail",
            "External API error - " + error.response?.data?.message,
            error.response?.status || 500,
            "EXTERNAL_ERROR",
            allRequestParams,
          );
        }

        if (error.request) {
          // Request sent but no response

          return this.handleResponse(
            res,
            existingKey.user_id,
            existingKey._id,
            req.method,
            startTime,
            "fail",
            "External API error -No response from external API",
            504,
            "EXTERNAL_ERROR",
            allRequestParams,
          );
        }

        // Something else (config issue, parsing, etc.)
        return this.handleResponse(
          res,
          existingKey.user_id,
          existingKey._id,
          req.method,
          startTime,
          "fail",
          error.message, // Changed from "External API error - Internal server error"
          500,
          "INTERNAL_SERVER",
          allRequestParams,
        );
      }

      // ✅ Success case
    } catch (err: any) {
      return res.status(500).json({
        status: "fail",
        message: err.message,
        stack: err.stack,
      });
    }
  };
}

export const proxyController = new ProxyController();
