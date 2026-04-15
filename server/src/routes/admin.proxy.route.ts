import express from "express";
import { proxyController } from "../controllers/admin.proxy.controller";
import {
  validateAdd,
  isRequestValidated,
  validateEdit,
  validateId,
} from "../validations/proxy.validator";
import authentication from "../middleware/auth.middleware";

const proxyRouter = express.Router();
proxyRouter.post(
  "/",
  authentication,
  validateAdd,
  isRequestValidated,
  proxyController.addData,
);
proxyRouter.get("/", authentication, proxyController.getDatas);
proxyRouter.put(
  "/:id",
  authentication,
  validateId,
  validateEdit,
  isRequestValidated,
  proxyController.updateData,
);
proxyRouter.delete(
  "/:id",
  authentication,
  validateId,
  proxyController.deleteData,
);
proxyRouter.get(
  "/get-list",
  authentication,
  validateId,
  proxyController.getList,
);
proxyRouter.get("/:id", authentication, validateId, proxyController.getData);

export default proxyRouter;
