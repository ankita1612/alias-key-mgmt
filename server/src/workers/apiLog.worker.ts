import { Worker } from "bullmq";
import redisQueueConnection from "../config/redisQueue.config";
import ApiHistoryModel from "../models/apiHistory.model";
import connectDB from "../config/db.config";

connectDB(); // 🔥 IMPORTANT

new Worker(
  "api-log-queue",
  async (job) => {
    await ApiHistoryModel.create(job.data);
  },
  {
    connection: redisQueueConnection,
    concurrency: 50,
  }
);