const Job = require('../models/Job')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const mongoose = require('mongoose')
const moment = require('moment')

const getAllJobs = async (req, res) => {
  const {
    query: { search, status, jobType, sort },
    user: { userId },
  } = req
  const queryObject = {
    createdBy: userId,
  }
  if (search) {
    queryObject.position = { $regex: search, $options: 'i' }
  }
  if (status && status !== 'all') {
    queryObject.status = status
  }
  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType
  }
  let results = Job.find(queryObject)
  if (sort === 'latest') {
    results = results.sort('-createdAt')
  }
  if (sort === 'oldest') {
    results = results.sort('createdAt')
  }
  if (sort === 'a-z') {
    results = results.sort('position')
  }
  if (sort === 'z-a') {
    results = results.sort('-position')
  }
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit
  results = results.limit(limit).skip(skip)
  const jobs = await results
  const totalJobs = await Job.countDocuments(queryObject)
  const numOfPages = Math.ceil(totalJobs / limit)
  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages })
}

const getJob = async (req, res) => {
  const {
    params: { id: jobId },
    user: { userId },
  } = req
  const job = await Job.findOne({ createdBy: userId, _id: jobId })
  if (!job) {
    throw new NotFoundError(`No job exists with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({ job })
}

const createJob = async (req, res) => {
  const {
    user: { userId },
  } = req
  req.body.createdBy = userId
  const job = await Job.create(req.body)
  res.status(StatusCodes.CREATED).json({ job })
}

const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req
  if (company === '') {
    throw new BadRequestError('Please provide company')
  }
  if (position === '') {
    throw new BadRequestError('Please provide position')
  }
  const job = await Job.findOneAndUpdate(
    { createdBy: userId, _id: jobId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )
  if (!job) {
    throw new NotFoundError(`No job exists with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({ job })
}

const deleteJob = async (req, res) => {
  const {
    params: { id: jobId },
    user: { userId },
  } = req
  const job = await Job.findOneAndRemove({ _id: jobId, createdBy: userId })
  if (!job) {
    throw new NotFoundError(`No job exists with id ${jobId}`)
  }
  res.status(StatusCodes.OK).send()
}

const showStats = async (req, res) => {
  const {
    user: { userId },
  } = req
  let stats = await Job.aggregate([
    {
      $match: { createdBy: new mongoose.Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ])

  stats = stats.reduce((acc, curr) => {
    const { _id: status, count } = curr
    acc[status] = count
    return acc
  }, {})

  const defaultStats = {
    interview: stats.interview || 0,
    declined: stats.declined || 0,
    pending: stats.pending || 0,
  }

  let monthlyApplications = await Job.aggregate([
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id.year': -1,
        '_id.month': -1,
      },
    },
    {
      $limit: 6,
    },
  ])

  monthlyApplications = monthlyApplications
    .map((i) => {
      const {
        _id: { year, month },
        count,
      } = i
      const date = moment()
        .year(year)
        .month(month - 1)
        .format('MMM Y')
      return {
        date,
        count,
      }
    })
    .reverse()

  res.status(StatusCodes.OK).json({
    defaultStats,
    monthlyApplications,
  })
}

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
}
