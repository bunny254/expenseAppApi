import RateLimiter from "../config/upstash.js";

const rateLimiter = async(req, res, next) =>{
    try {
        //Currently blocks whole app requests if limit exceeded.
        const {success} = await RateLimiter.limit("my-rate-limit")
        
        if(!success){
            return res.status(429).json({message:"Too many requests. Please try again later."})
        }

        next()
        
    } catch (error) {
        console.error("Rate Limiter Error:", error)
        next(error)
    }
}

export default rateLimiter;