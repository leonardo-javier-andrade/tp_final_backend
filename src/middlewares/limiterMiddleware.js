import rateLimit from "express-rate-limit"

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).

  handler: (req, res) => {
    res.status(429).json({ error: "Too many requests, please try again later." })
  }
})

export { limiter }