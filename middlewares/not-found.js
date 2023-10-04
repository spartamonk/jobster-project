const { StatusCodes } = require('http-status-codes')

const notFoundMiddleware = async (req, res) => {
  res.status(StatusCodes.NOT_FOUND).send('Resources not found')
}

module.exports = notFoundMiddleware
