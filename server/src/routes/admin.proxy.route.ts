import express from "express";
import { proxyController } from "../controllers/admin.proxy.controller";

const proxyRouter = express.Router();
proxyRouter
  .route("/")
  .get(proxyController.getProxyResponse)
  .post(proxyController.getProxyResponse);
export default proxyRouter;
