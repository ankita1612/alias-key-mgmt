import express from "express";
import { proxyController } from "../controllers/admin.proxyAPI.controller";

const proxyAPIRouter = express.Router();
proxyAPIRouter
  .route("/")
  .get(proxyController.getProxyResponse)
  .post(proxyController.getProxyResponse);
export default proxyAPIRouter;
