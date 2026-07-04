import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Create a new ratelimiter, that allows 5 requests per 1 minute
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});
