const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Invalid credentials')
  }
  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const isTestUser = payload.userId === '651d01df98d367afd9c55010'
    const { userId } = payload

    req.user = {
      userId,
      isTestUser,
    }
    next()
  } catch (error) {
    throw new UnauthenticatedError('Invalid credentials')
  }
}

module.exports = authMiddleware
