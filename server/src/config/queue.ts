import { Queue } from "bullmq";
import redisClient from "./redis.config";

export const apiLogQueue = new Queue("api-log-queue", {
  connection: redisClient,
});