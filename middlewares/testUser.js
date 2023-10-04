const { BadRequestError } = require('../errors')

const testUser = async (req, res, next) => {
  const {
    user: { isTestUser },
  } = req
  if (isTestUser) {
    throw new BadRequestError('Test User. Read only access')
  }
  next()
}

module.exports = testUser
