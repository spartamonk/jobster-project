const express = require('express')
const router = express.Router()
const { login, register, updateUser } = require('../controllers/auth')
const { authMiddleware, testUser } = require('../middlewares')
const { rateLimit } = require('express-rate-limit')

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: 'draft-7', // Set `RateLimit` and `RateLimit-Policy` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // store: ... , // Use an external store for more precise rate limiting
  message: {
    msg: 'Maximum number of requests exceeded, try again after 15 minutes',
  },
})

router.route('/register').post(apiLimiter, register)
router.route('/login').post(apiLimiter, login)
router.route('/updateUser').patch(authMiddleware, testUser, updateUser)

module.exports = router
