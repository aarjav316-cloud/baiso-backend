import { createClient } from "redis";

let redisClient = null;

export const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error("Redis: Max reconnection attempts reached");
            return new Error("Redis connection failed");
          }
          return retries * 100; // Exponential backoff
        },
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("Redis connecting...");
    });

    redisClient.on("ready", () => {
      console.log("Redis Connected");
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("Redis Connection Error:", error.message);
    // Don't exit process, allow app to run without Redis
    console.warn(
      "App running without Redis - OTP functionality may be limited",
    );
    return null;
  }
};

export const getRedisClient = () => {
  if (!redisClient || !redisClient.isOpen) {
    console.warn("Redis client not available");
    return null;
  }
  return redisClient;
};

export const disconnectRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    console.log("Redis Disconnected");
  }
};
