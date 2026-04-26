import express from "express";
import { aliasKeyLogController } from "../controllers/aliasKeyLog.controller";
import {
  validateAdd,
  isRequestValidated,
  validateId,
} from "../validations/aliasKeyLog.validations";
const aliasKeyRouter = express.Router();
import authentication from "../middleware/auth.middleware";
aliasKeyRouter.post(
  "/",
  authentication,
  //  validateAdd,
  isRequestValidated,
  aliasKeyLogController.addData,
);
aliasKeyRouter.get("/", authentication, aliasKeyLogController.getDatas);

aliasKeyRouter.get(
  "/:id",
  authentication,
  validateId,
  aliasKeyLogController.getData,
);

export default aliasKeyRouter;
