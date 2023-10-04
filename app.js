require('dotenv').config()
require('express-async-errors')
// security
const helmet = require('helmet')
const xss = require('xss-clean')

const path = require('path')
const express = require('express')
const app = express()
const connectDB = require('./db/connect')
const {
  errorHandlerMiddleware,
  notFoundMiddleware,
  authMiddleware,
} = require('./middlewares')
const authRouter = require('./routers/auth')
const jobsRouter = require('./routers/jobs')

// middlewares
// parse html files
app.use(express.urlencoded({ extended: false }))
// parse json
app.use(express.json())
// static files
app.use(express.static(path.resolve(__dirname, './client/build')))
app.use(helmet())
app.use(xss())

// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authMiddleware, jobsRouter)
// send index.html file for routes not api
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
})
// notfound
app.use(notFoundMiddleware)
// error
app.use(errorHandlerMiddleware)

// start

const port = process.env.PORT || 3000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    )
  } catch (error) {
    console.log(error)
  }
}

start()
