const notFoundMiddleware = require('./not-found')
const errorHandlerMiddleware = require('./error-handler')
const authMiddleware = require('./auth')
const testUser = require('./testUser')
module.exports = {
  notFoundMiddleware,
  errorHandlerMiddleware,
  authMiddleware,
  testUser,
}
