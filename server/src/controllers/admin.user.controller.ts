import { Request, Response, NextFunction } from "express";
import { userService } from "../services/admin.user.service";
import IUser, { GetUsersQuery } from "../interface/user.interface";
import { Types } from "mongoose";
import AliasKeyModel from "../models/aliasKey.model";
class UserController {
  addUser = async (
    req: Request<{}, {}, IUser>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserByAliasId = async (
    req: Request<{ alias_id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { alias_id } = req.params;

      // ✅ Step 1: Find alias key
      const alias = await AliasKeyModel.findById(alias_id).lean();

      if (!alias) {
        res.status(404).json({
          success: false,
          message: "Alias key not found",
        });
        return;
      }

      // ✅ Step 2: Get user using user_id
      const user = await userService.getUser(alias.user_id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // ✅ Final response
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  getUser = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await userService.getUser(id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };
  getUsers = async (req: Request, res: Response) => {
    const query: GetUsersQuery = {
      search: req.query.search as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as "asc" | "desc",
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
    };

    const users = await userService.getUsers(query);
    res.json(users);
  };
  updateUser = async (
    req: Request<{ id: string }, {}, Partial<IUser>>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await userService.deleteUser(req.params.id);
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: [],
      });
    } catch (error) {
      next(error);
    }
  };
}
export const userController = new UserController();
