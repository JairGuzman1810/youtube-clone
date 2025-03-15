import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Initialize rate limiter using Upstash Redis
export const ratelimit = new Ratelimit({
  redis, // Redis instance for storing rate limit data
  limiter: Ratelimit.slidingWindow(10, "10 s"), // Allow 10 requests per 10 seconds using a sliding window strategy
});
