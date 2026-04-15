import { Request, Response, NextFunction } from "express";
import ProxyModel from "../models/proxy.model";

class ProxyController {
  // ✅ CREATE
  addData = async (req: Request, res: Response, next: NextFunction) => {
    try { 

      const data = req.body;
      const proxy = await ProxyModel.create({
        domain:data.domain?.trim(),
        project_name:data.project_name?.trim(),
        proxy_name:data.proxy_name?.trim(),
        proxy_token:data.proxy_token?.trim(),
        curl:data.curl?.trim(),
        credit:data.credit?.trim(),
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

      const skip = (page - 1) * limit;

      const match: any = {};

      if (search) {
        match.$or = [
          { domine: { $regex: search, $options: "i" } },
          { project_name: { $regex: search, $options: "i" } },
          { proxy_name: { $regex: search, $options: "i" } },
          { proxy_token: { $regex: search, $options: "i" } },
          { curl: { $regex: search, $options: "i" } },
        ];
      }

      const [data, total] = await Promise.all([
        ProxyModel.find(match).sort({ createdAt: -1 }).skip(skip).limit(limit),

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

      const proxy = await ProxyModel.findById(id);

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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { id } = req.params;

      const updated = await ProxyModel.findByIdAndUpdate(
        id,
        { $set: req.body },
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

      const deleted = await ProxyModel.findByIdAndDelete(id);

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
}

export const proxyController = new ProxyController();
