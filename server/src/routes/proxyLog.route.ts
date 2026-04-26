import express, { Router } from "express";
import proxyLogController from "../controllers/proxyLog.controller";
import { authentication } from "../middleware/auth.middleware";

const router: Router = express.Router();

// // ✅ Create proxy log
router.post("/", authentication, proxyLogController.addLog);

// // ✅ Get logs for a specific proxy
router.get("/:id", authentication, proxyLogController.getLogs);

// // ✅ Get all logs with filters
router.get("/", authentication, proxyLogController.getAllLogs);

// // ✅ Get log statistics
router.get("/stats/by-action", authentication, proxyLogController.getLogStats);

export default router;
