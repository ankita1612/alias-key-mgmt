import { Request, Response, NextFunction } from "express";
import { IProxyLog } from "../interface/IProxyLog.interface";
import { Types } from "mongoose";
import { ProxyLogModel } from "../models/proxyLog.model";

class ProxyLogController {
  // ✅ CREATE LOG
  addLog = async (
    req: Request<{}, {}, IProxyLog>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { proxy_id, action, desc, meta } = req.body;

      if (!Types.ObjectId.isValid(proxy_id)) {
        res.status(400).json({ success: false, message: "Invalid proxy_id" });
        return;
      }

      const result = await ProxyLogModel.create({
        proxy_id,
        action,
        desc,
        user_id: req.user.id, // ✅ from auth middleware
        meta: meta || {},
      });

      res.status(201).json({
        success: true,
        message: "Proxy log created successfully",
        result,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ GET LOGS FOR A SPECIFIC PROXY
  getLogs = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid proxy ID" });
        return;
      }

      const logs = await ProxyLogModel.find({ proxy_id: id })
        .sort({ created_date: -1, _id: -1 })
        .populate("proxy_id", "proxy_name domain_name")
        .populate("user_id", "first_name email");

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ GET ALL LOGS WITH PAGINATION AND FILTERS
  getAllLogs = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = ((req.query.search as string) || "").trim();
      const proxyId = req.query.proxy_id as string;
      const action = req.query.action as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const sortField = (req.query.sortField as string) || "created_date";
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

      const skip = (page - 1) * limit;

      // 🔥 Base match
      const match: any = {};

      if (proxyId && Types.ObjectId.isValid(proxyId)) {
        match.proxy_id = new Types.ObjectId(proxyId);
      }

      if (action && ["CREATE", "UPDATE", "DELETE"].includes(action)) {
        match.action = action;
      }

      // 🔥 Date range filter
      if (startDate || endDate) {
        match.created_date = {};
        if (startDate) {
          match.created_date.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          match.created_date.$lte = end;
        }
      }

      // 🔥 Search in desc field
      if (search) {
        match.$or = [{ desc: { $regex: search, $options: "i" } }];
      }

      const total = await ProxyLogModel.countDocuments(match);
      const logs = await ProxyLogModel.find(match)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate("proxy_id", "proxy_name domain_name")
        .populate("user_id", "first_name email");

      res.status(200).json({
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ GET LOG STATS (count by action)
  getLogStats = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const proxyId = req.query.proxy_id as string;

      const match: any = {};
      if (proxyId && Types.ObjectId.isValid(proxyId)) {
        match.proxy_id = new Types.ObjectId(proxyId);
      }

      const stats = await ProxyLogModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$action",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new ProxyLogController();
