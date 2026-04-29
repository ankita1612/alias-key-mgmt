const express = require("express");
const adminAuthRouter = express.Router();
import {
  validateLogin,
  isRequestValidated,
  changePasswordValidator,
  updateProfileValidator,
} from "../validations/auth.validations";
import authentication from "../middleware/auth.middleware";
import { authController } from "../controllers/auth.controller";

adminAuthRouter.post(
  "/login",
  validateLogin,
  isRequestValidated,
  authController.login,
);
adminAuthRouter.post("/logout", authController.logout);
adminAuthRouter.get("/profile", authentication, authController.profile);

export default adminAuthRouter;
