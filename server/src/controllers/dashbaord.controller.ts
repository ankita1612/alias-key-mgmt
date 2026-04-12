import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/api.error";
import  ApiHistoryModel from "../models/apiHistory.model";
import  User from "../models/user.model";
import  AliasKeyModel from "../models/aliasKey.model";
class DashboardController {

   getDeshboardData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if(req.user.role==="User")
      {
        res.json("User")   
      }
      else 
      {
        res.json("Admin")   
      }
     
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
