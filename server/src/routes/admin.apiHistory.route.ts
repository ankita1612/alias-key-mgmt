import express from "express";
import { apiHistoryController } from "../controllers/apiHistory.controller";
import authentication from "../middleware/auth.middleware";

const apiHisoryRouter = express.Router();
apiHisoryRouter.get("/", authentication, apiHistoryController.getApiHistory);
  
export default apiHisoryRouter;
