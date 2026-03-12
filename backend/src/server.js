import 'dotenv/config'
import app from './app.js'
import config from './config/index.js'
import { getConnection, closeConnection } from './db/connection.js'

const PORT = config.PORT || 3000

// 初始化資料庫連線
getConnection().catch((error) => {
  console.error('Failed to initialize database connection:', error)
  process.exit(1)
})

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
  console.log(`📝 Environment: ${config.NODE_ENV || 'development'}`)
})

// 優雅關閉
const gracefulShutdown = async () => {
  console.log('Closing HTTP server...')
  server.close(async () => {
    console.log('HTTP server closed')
    try {
      await closeConnection()
      console.log('Database connection closed')
    } catch (error) {
      console.error('Error closing database connection:', error)
    }
    process.exit(0)
  })
}

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received')
  gracefulShutdown()
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received')
  gracefulShutdown()
})
