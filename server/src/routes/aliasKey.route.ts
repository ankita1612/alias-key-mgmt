import express from "express";
import { aliasKeyController } from "../controllers/aliasKey.controller";
import {
  validateAdd,
  isRequestValidated,
  validateEdit,
  validateId,
} from "../validations/aliasKey.validations";
const aliasKeyRouter = express.Router();
import authentication from "../middleware/auth.middleware";
aliasKeyRouter.post(
  "/perform-action",
  authentication,
  validateId,
  aliasKeyController.changeRequest,
);
aliasKeyRouter.post(
  "/make-active-inactive",
  authentication,
  validateId,
  aliasKeyController.makeActiveInactive,
);
aliasKeyRouter.post(
  "/",
  authentication,
  validateAdd,
  isRequestValidated,
  aliasKeyController.addData,
);
aliasKeyRouter.get(
  "/key-monotor",
  authentication,
  aliasKeyController.getDatasKeyMonitor,
);

aliasKeyRouter.get("/", authentication, aliasKeyController.getDatas);
aliasKeyRouter.put(
  "/:id",
  authentication,
  validateId,
  validateEdit,
  isRequestValidated,
  aliasKeyController.updateData,
);
aliasKeyRouter.delete(
  "/:id",
  authentication,
  validateId,
  aliasKeyController.deleteData,
);
aliasKeyRouter.get(
  "/:id",
  authentication,
  validateId,
  aliasKeyController.getData,
);

export default aliasKeyRouter;
