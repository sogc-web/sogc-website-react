const app = require('./src/app')
const { env } = require('./src/config/env')
const { connectToDatabase } = require('./src/config/database')

async function startServer() {
  await connectToDatabase()

  app.listen(env.port, () => {
    console.log(`SOGC backend listening on port ${env.port}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start backend:', error)
  process.exit(1)
})
