import { Request, Response, NextFunction } from "express";
import { IProxyLog } from "../interface/IProxyLog.interface";
import { Types } from "mongoose";
import { ProxyLogModel } from "../models/proxyLog.model";

class ProxyLogController {
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
}

export default new ProxyLogController();
