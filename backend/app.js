const express = require('express')
const app = express()

const cors = require('cors')
const { default: mongoose } = require('mongoose')
const router = require('./routes/TaskRoutes')
const authRouter = require('./routes/AuthRoutes')

require('dotenv').config()

app.use(cors())
app.use(express.json())

const connectDb = async () => {
  try {
    const conn = mongoose.connect(process.env.MONGODB)
console.log('Mongodb connected: ',)
  } catch (error) {
    console.log('error at connecting mongo db: ', error.message)
    process.exit(1)
  }
}

connectDb()
app.use('/', router)
app.use('/auth',authRouter)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server runing at http://localhost:${PORT}`)
})