const mongoose = require('mongoose')

const JobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company is required'],
      maxlength: [50, 'Company must not be more than 50 characters'],
    },
    position: {
      type: String,
      required: [true, 'Postion is required'],
      maxlength: [100, 'Position must not be more than 100 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['interview', 'declined', 'pending'],
        message: '{VALUE} is not supported',
      },
      default: 'pending',
    },
    jobType: {
      type: String,
      enum: {
        values: ['full-time', 'part-time', 'remote', 'internship'],
        message: '{VALUE} is not supported',
      },
      default: 'full-time',
    },
    jobLocation: {
      type: String,
      required: [true, 'Location is required'],
      default: 'my city',
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Job', JobSchema)
