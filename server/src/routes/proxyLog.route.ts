import express, { Router } from "express";
import proxyLogController from "../controllers/proxyLog.controller";
import { authentication } from "../middleware/auth.middleware";

const router: Router = express.Router();

router.get("/:id", authentication, proxyLogController.getLogs);

export default router;
