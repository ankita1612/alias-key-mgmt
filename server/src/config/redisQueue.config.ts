import IORedis from "ioredis";

const redisQueueConnection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null, // 🔥 REQUIRED for BullMQ
});

export default redisQueueConnection;