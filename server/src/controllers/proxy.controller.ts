import { Request, Response, NextFunction } from "express";
import AliasKeyModel from "../models/aliasKey.model";
import ProxyModel from "../models/proxy.model";
import { toJsonString } from "curlconverter";
import mongoose from "mongoose";

function extractPostData(curl: string) {
  const match =
    curl.match(/--data-raw\s+'([^']+)'/) ||
    curl.match(/--data\s+'([^']+)'/) ||
    curl.match(/--data-binary\s+'([^']+)'/) ||
    curl.match(/--data-raw\s+"([^"]+)"/) ||
    curl.match(/--data\s+"([^"]+)"/);

  if (!match) return {};

  try {
    return JSON.parse(match[1]);
  } catch {
    return {};
  }
}

function extractUrl(curl: string) {
  const match =
    curl.match(/'(https?:\/\/[^']+)'/) || curl.match(/"(https?:\/\/[^"]+)"/);

  return match ? match[1] : "";
}

class ProxyController {
  // ✅ CREATE

  addData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      if (!data.curl || typeof data.curl !== "string") {
        throw new Error("Curl is required and must be a string");
      }

      let json: any;

      // ✅ Safe parsing
      try {
        json = JSON.parse(toJsonString(data.curl.trim()));
      } catch (err) {
        throw new Error("Invalid curl format.");
      }

      // ✅ Always get URL (fallback to regex)
      const url = extractUrl(data.curl) || json.url;

      // ❌ OLD (REMOVE THIS)
      // json.queries logic

      // ✅ ALWAYS parse from URL
      let queryParamsObj: Record<string, string> = {};

      if (url) {
        queryParamsObj = Object.fromEntries([
          ...new URL(url).searchParams.entries(),
        ]);
      }

      // ✅ Extract POST (optional)
      const postData = extractPostData(data.curl);

      // ✅ Final params
      const finalParams =
        Object.keys(postData).length > 0 ? postData : queryParamsObj;

      //res.json(finalParams);
      // ✅ Save in DB
      const proxy = await ProxyModel.create({
        proxy_name: data.proxy_name?.trim(),
        proxy_token: data.proxy_token?.trim(),
        curl_token: data.curl_token?.trim(),
        curl: data.curl?.trim(),
        query_params: finalParams,
        domain_name: data.domain_name?.trim(),
        project_name: data.project_name?.trim(),
      });

      res.status(201).json({
        success: true,
        message: "Proxy created successfully",
        data: proxy,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ GET ALL (with pagination + search)
  getDatas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = ((req.query.search as string) || "").trim();
      const sortField = (req.query.sortField as string) || "createdAt";
      const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;
      const skip = (page - 1) * limit;
      const is_deleted =
        req.query.is_deleted === "true"
          ? true
          : req.query.is_deleted === "false"
            ? false
            : false;

      const match: any = {};

      //   is_deleted: false,
      // };
      if (req.query.is_deleted !== undefined) {
        match.is_deleted = req.query.is_deleted === "true";
      } else {
        match.is_deleted = false;
      }
      if (search) {
        const isNumber = !isNaN(Number(search));

        match.$or = [
          { proxy_name: { $regex: search, $options: "i" } },          
          { curl: { $regex: search, $options: "i" } },          
          ...(isNumber ? [{ credit: Number(search) }] : []),
        ];
      }

      const [data, total] = await Promise.all([
        ProxyModel.find(match)
          .sort({ [sortField]: sortOrder }) // ✅ FIXED
          .skip(skip)
          .limit(limit)
          .lean(),

        ProxyModel.countDocuments(match),
      ]);

      res.status(200).json({
        success: true,
        data,
        pagination: {
          total,
          page,
          limit,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ GET SINGLE
  getData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const proxy = await ProxyModel.findOne({
        _id: id,
        is_deleted: false, // ✅ important for soft delete
      });

      if (!proxy) {
        return res.status(404).json({
          success: false,
          message: "Proxy not found",
        });
      }

      res.status(200).json({
        success: true,
        data: proxy,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ UPDATE
  updateData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const updated = await ProxyModel.findOneAndUpdate(
        { _id: id, is_deleted: false },
        {
          domain_name: req.body.domain_name,
          project_name: req.body.project_name,
        },
        { new: true },
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Proxy not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Proxy updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ DELETE
  deleteData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const deleted = await ProxyModel.findByIdAndUpdate(
        id,
        {
          is_deleted: true,
          deleted_at: new Date(),
        },
        { new: true },
      );

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Proxy not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Proxy deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  getList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const proxies = await ProxyModel.find({ is_deleted: false }) // ✅ filter
        .select("_id proxy_name curl")
        .sort({ createdAt: -1 })
        .lean();

      if (!proxies) {
        return res.status(404).json({
          success: false,
          message: "Proxy not found",
        });
      }

      res.status(200).json({
        success: true,
        data: proxies,
      });
    } catch (error) {
      next(error);
    }
  };

  getProxyDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const proxy = await ProxyModel.findById(id).lean();

      if (!proxy) {
        return res.status(404).json({ message: "Proxy not found" });
      }

      const result = await AliasKeyModel.aggregate([
        {
          $match: {
            proxy_id: new mongoose.Types.ObjectId(id),
          },
        },

        // 🔹 Join API History
        {
          $lookup: {
            from: "api_history",
            localField: "_id",
            foreignField: "user_alias_key_id",
            as: "history",
          },
        },

        // 🔹 Add API count
        {
          $addFields: {
            api_history_count: { $size: "$history" },
          },
        },

        // 🔹 Split into data + stats
        {
          $facet: {
            aliasKeys: [
              {
                $project: {
                  alias_key: 1,
                  status: 1,
                  key_status: 1,
                  approval_status: 1,
                  createdAt: 1,
                  api_history_count: 1,
                },
              },
            ],

            stats: [
              {
                $group: {
                  _id: null,

                  // ✅ 1. Active
                  active: {
                    $sum: {
                      $cond: [{ $eq: ["$key_status", "Active"] }, 1, 0],
                    },
                  },

                  // ✅ 2. Active + Approved
                  active_approved: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$key_status", "Active"] },
                            { $eq: ["$approval_status", "Approved"] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },

                  // ✅ 3. Active + Rejected
                  active_rejected: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$key_status", "Active"] },
                            { $eq: ["$approval_status", "Rejected"] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },

                  // ✅ 4. Active + Pending
                  active_pending: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$key_status", "Active"] },
                            { $eq: ["$approval_status", "Pending"] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  inactive: {
                    $sum: {
                      $cond: [{ $eq: ["$key_status", "Inactive"] }, 1, 0],
                    },
                  },
                  // ✅ 5. Inactive + Approved
                  inactive_approved: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$key_status", "Inactive"] },
                            { $eq: ["$approval_status", "Approved"] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },

                  // ✅ 6. Inactive + Rejected
                  inactive_rejected: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$key_status", "Inactive"] },
                            { $eq: ["$approval_status", "Rejected"] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },

                  // ✅ 7. Inactive + Pending
                  inactive_pending: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$key_status", "Inactive"] },
                            { $eq: ["$approval_status", "Pending"] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      ]);

      const aliasKeys = result[0]?.aliasKeys || [];
      const stats = result[0]?.stats[0] || {
        active: 0,
        active_approved: 0,
        active_rejected: 0,
        active_pending: 0,
        inactive: 0,
        inactive_approved: 0,
        inactive_rejected: 0,
        inactive_pending: 0,
      };

      return res.json({
        data: {
          proxy,
          stats,
          aliasKeys,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const proxyController = new ProxyController();
