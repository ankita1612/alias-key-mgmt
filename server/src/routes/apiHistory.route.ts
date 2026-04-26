import express from "express";
import { apiHistoryController } from "../controllers/apiHistory.controller";
import authentication from "../middleware/auth.middleware";

const apiHistoryRouter = express.Router();
apiHistoryRouter.get(
  "/get-detail/:id",
  authentication,
  apiHistoryController.getApiHistoryDetail,
);
apiHistoryRouter.get(
  "/:aliasKeyId",
  authentication,
  apiHistoryController.getApiHistory,
);
apiHistoryRouter.get("/", authentication, apiHistoryController.getApiHistory);

export default apiHistoryRouter;
