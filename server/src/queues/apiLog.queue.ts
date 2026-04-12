import { Queue } from "bullmq";
import redisQueueConnection from "../config/redisQueue.config";


// Queue name (must match worker)
const QUEUE_NAME = "api-log-queue";

export const apiLogQueue = new Queue("api-log-queue", {
  connection: redisQueueConnection,

  defaultJobOptions: {
    attempts: 3, // retry failed jobs
    backoff: {
      type: "exponential",
      delay: 1000, // 1s → 2s → 4s
    },
    removeOnComplete: true, // auto cleanup
    removeOnFail: false, // keep failed jobs for debugging
  },
});