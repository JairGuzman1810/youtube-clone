import { Redis } from "@upstash/redis";

// Initialize Upstash Redis instance
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL, // Redis REST API URL from environment variables
  token: process.env.UPSTASH_REDIS_REST_TOKEN, // Authentication token from environment variables
});
