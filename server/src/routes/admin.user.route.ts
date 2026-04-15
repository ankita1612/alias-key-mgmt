import express from "express";
import { userController } from "../controllers/admin.user.controller";
import {
  validateAdd,
  isRequestValidated,
  validateEdit,
  validateId,
} from "../validations/admin.user.validations";
const userRouter = express.Router();
import authentication from "../middleware/auth.middleware";
userRouter.post("/", validateAdd, isRequestValidated, userController.addUser);
userRouter.get(
  "/get-user-by-alias_id/:alias_id",
  userController.getUserByAliasId,
);
userRouter.get("/", userController.getUsers);
userRouter.put(
  "/:id",
  authentication,
  validateId,
  validateEdit,
  isRequestValidated,
  userController.updateUser,
);
userRouter.delete(
  "/:id",
  authentication,
  validateId,
  userController.deleteUser,
);
userRouter.get("/:id", authentication, validateId, userController.getUser);

export default userRouter;
