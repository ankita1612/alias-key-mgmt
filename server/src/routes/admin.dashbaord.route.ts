import express from "express";
import { dashboardController } from "../controllers/dashbaord.controller";
import authentication from "../middleware/auth.middleware";

const dashboardRouter = express.Router();
dashboardRouter.get("/", authentication, dashboardController.getDeshboardData);
  
export default dashboardRouter;
