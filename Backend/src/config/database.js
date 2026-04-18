const mongoose = require('mongoose')
const { env } = require('./env')

let hasConnected = false

async function connectToDatabase() {
  if (!env.mongodbUri) {
    console.warn('MONGODB_URI is not set. Backend will start without a database connection.')
    return
  }

  if (hasConnected) {
    return
  }

  await mongoose.connect(env.mongodbUri)
  hasConnected = true
  console.log('MongoDB connected')
}

module.exports = { connectToDatabase }
