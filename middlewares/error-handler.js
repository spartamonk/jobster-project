const { StatusCodes } = require('http-status-codes')
const errorHandlerMiddleware = async (err, req, res, next) => {
  const customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, please try again later',
  }
  if (err.name === 'ValidationError') {
    customError.statusCode = StatusCodes.BAD_REQUEST
    customError.msg = Object.values(err.errors)
      .map((i) => {
        return i.message
      })
      .join(', ')
  }
  if (err.name === 'CastError') {
    customError.statusCode = StatusCodes.NOT_FOUND
    customError.msg = `No job exists with id ${err.value}`
  }
  if (err.code === 11000) {
    customError.statusCode = StatusCodes.BAD_REQUEST
    customError.msg = `The ${Object.keys(
      err.keyValue
    )} already exists, please use a different ${Object.keys(err.keyValue)}`
  }

  res
    .status(customError.statusCode)
    .json({ success: false, msg: customError.msg })
}

module.exports = errorHandlerMiddleware
