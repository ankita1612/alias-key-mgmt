import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/api.error";
import  ApiHistoryModel from "../models/apiHistory.model";

class ApiHistoryController {

   getApiHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user; // assuming added via auth middleware

      // ✅ Query params
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const sortBy = (req.query.sortBy as string) || "createdAt";
      const order = (req.query.order as string) === "asc" ? 1 : -1;

      const skip = (page - 1) * limit;

      // ✅ Base filter
      let filter: any = {};

      // 🔐 Role-based filter
      if (user.role !== "Admin") {
        filter.user_id = user._id;
      }

      // 🔍 Search filter
      if (search) {
        filter.$or = [
          { "request_info.url": { $regex: search, $options: "i" } },
          { "request_info.method": { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
        ];
      }

      // ✅ Query
      const [data, total] = await Promise.all([
        ApiHistoryModel.find(filter)
          .sort({ [sortBy]: order })
          .skip(skip)
          .limit(limit)
          .populate("user_id", "first_name email")
          .populate("user_alias_key_id", "alias_key")
          .lean(),

        ApiHistoryModel.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const apiHistoryController = new ApiHistoryController();
