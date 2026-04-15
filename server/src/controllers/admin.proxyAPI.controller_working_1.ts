import { Request, Response } from "express";
import AliasKeyModel from "../models/aliasKey.model";
import ProxyModel from "../models/proxy.model";
//import { axiosInstance } from "../utils/axiosInstance";
//import { parseCurl } from "../utils/parseCurl";
import axios from "axios";
import http from "http";
import https from "https";

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
  const urlMatch = curl.match(/'(.*?)'/);
  if (urlMatch) result.url = urlMatch[1];

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
  getProxyResponse = async (req: Request, res: Response) => {
    const startTime = Date.now();

    const alias_key = req.query.alias_key || req.body.alias_key;

    if (!alias_key) {
      return res.status(400).json({ message: "Alias key required" });
    }

    try {
      // ✅ Merge params (GET + POST support)
      const requestParams = {
        ...req.query,
        ...req.body,
      };

      delete requestParams.alias_key;

      // ✅ Atomic quota update
      const aliasKey = await AliasKeyModel.findOneAndUpdate(
        {
          alias_key,
          status: "Active",
          remaining_quota: { $gt: 0 },
        },
        { $inc: { remaining_quota: -1 } },
        { new: true },
      ).lean();

      if (!aliasKey) {
        return res.status(403).json({
          message: "Invalid / inactive / quota exceeded",
        });
      }

      // ✅ Fetch proxy (use lean for performance)
      const proxy = await ProxyModel.findById(aliasKey.proxy_id).lean();

      if (!proxy) {
        return res.status(404).json({ message: "Proxy not found" });
      }

      const { curl, proxy_token, query_params } = proxy;

      // ✅ Validate params (exclude token)
      for (const key of Object.keys(query_params)) {
        if (key === "token") continue;

        if (!(key in requestParams)) {
          return res.status(400).json({
            message: `Missing param: ${key}`,
          });
        }
      }

      // ✅ Parse curl (IMPORTANT)
      const parsed = parseCurl(curl);

      let [baseUrl, existingQuery] = parsed.url.split("?");

      const urlParams = new URLSearchParams(existingQuery || "");

      // ✅ Replace params
      for (const key of Object.keys(query_params)) {
        if (key === "token") {
          urlParams.set(key, proxy_token);
        } else {
          urlParams.set(key, String(requestParams[key]));
        }
      }

      const finalUrl = `${baseUrl}?${urlParams.toString()}`;
      // res.json(finalUrl);
      // ✅ Execute request
      const response = await axiosInstance.request({
        method: parsed.method as any,
        url: finalUrl,
        headers: parsed.headers,
        data: parsed.data,
      });

      return res.json({
        status: "success",
        execution_time: `${Date.now() - startTime}ms`,
        data: response.data,
      });
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
