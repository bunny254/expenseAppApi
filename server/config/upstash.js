import { Redis } from '@upstash/redis'
import rateLimit from '@upstash/ratelimit'

import 'dotenv/config'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const RateLimiter = new rateLimit.Ratelimit({
  redis: redis,
  limiter: rateLimit.Ratelimit.slidingWindow(50, '60 s'),
})

export default RateLimiter