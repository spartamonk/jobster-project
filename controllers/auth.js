const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')
const register = async (req, res) => {
  const user = await User.create(req.body)
  const token = user.createJWT()
  res.status(StatusCodes.CREATED).json({
    user: {
      name: user.name,
      email: user.email,
      lastName: user.lastName,
      location: user.location,
      token,
    },
  })
}

const login = async (req, res) => {
  const {
    body: { email, password },
  } = req
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password')
  }
  const user = await User.findOne({ email })
  if (!user) {
    throw new UnauthenticatedError('Invalid credentials')
  }
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid credentials')
  }
  const token = user.createJWT()
  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      location: user.location,
      token,
    },
  })
}

const updateUser = async (req, res) => {
  const {
    body: { name, lastName, email, location },
    user: { userId },
  } = req
  if (!name || !lastName || !email || !location) {
    throw new BadRequestError('Please provide all values')
  }
  const user = await User.findOne({ _id: userId })
  user.name = name
  user.lastName = lastName
  user.location = location
  user.email = email
  await user.save()
  const token = user.createJWT()
  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      location: user.location,
      token,
    },
  })
}
module.exports = {
  register,
  login,
  updateUser,
}
