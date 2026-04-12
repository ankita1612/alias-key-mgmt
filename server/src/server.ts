import express from "express";
import dotenv from "dotenv";
dotenv.config();
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { Request, Response, NextFunction } from "express";
import path from "path";
import http from "http";
import cookieParser from "cookie-parser";
import cluster from "cluster";
import os from "os";

import connectDB from "./config/db.config";

import adminAuthRouter from "./routes/admin.auth.route";
import adminUserRouter from "./routes/admin.user.route";
import aliasKeyRouter from "./routes/admin.aliasKey.route";
import proxyRouter from "./routes/admin.proxy.route";
import apiHisoryRouter from "./routes/admin.apiHistory.route";
import dashboardRouter from "./routes/admin.dashbaord.route";

// import reportRouter from "./routes/user.report.route";
import errorHandler from "./middleware/error.handler";
import ApiError from "./utils/api.error";
import { errors } from "mongodb-memory-server";
//import uploadRoutes from "./routes/upload.route";

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart worker
  });
} else {
  const app = express();

  // middlewares
  app.use(cookieParser());

  app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true })); //Allows browser to send secure credentials with request
  //credentials: true => if you are passing cookie from frontend
  app.use(helmet({ crossOrigisnResourcePolicy: false }));
  // Rate limit for general routes, but allow higher for proxy
  app.use('/api/get-proxy-response', rateLimit({ windowMs: 60 * 1000, max: 200000  })); // 200k per minute for proxy
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // 100 per 15 min for others
  app.use(express.json({ limit: "500mb" }));
  app.use(express.urlencoded({ limit: "500mb", extended: true }));
``
  app.use("/api/auth", adminAuthRouter);
  app.use("/api/user", adminUserRouter);
  app.use("/api/alias-key", aliasKeyRouter);
  app.use("/api/get-proxy-response", proxyRouter);
  app.use("/api/api-hisory", apiHisoryRouter);
  app.use("/api/dashboard", dashboardRouter);


  //page not found
  app.use((req: Request, res: Response, next: NextFunction) => {
    next(new ApiError("Page not found", 404));
  });

  app.use(errorHandler);

  let server: http.Server | undefined;
  const PORT = process.env.PORT || 3000;
  connectDB()
    .then(() => {
      server = app.listen(PORT, () => {
        console.log(`Worker ${process.pid} running on port ${PORT}`);
      });

      // Set socket timeout for large file uploads
      server.timeout = 20 * 60 * 1000; // 20 minutes
      server.keepAliveTimeout = 25 * 60 * 1000; // 25 minutes
      server.headersTimeout = 30 * 60 * 1000;
    })
    .catch((err) => {
      console.error("DB connection failed:", err);
      process.exit(1);
    });

  // process handlers
  process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:", err);
    process.exit(1);
  });

  process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION:", err);
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    if (server) {
      server.close(() => process.exit(0));
    } else {
      process.exit(0);
    }
  });
}
