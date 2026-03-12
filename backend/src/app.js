import express from 'express'
import apiRoutes from './routes/index.js'

const app = express()

// 基本中間件
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS 設置（開發用，允許所有來源）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// 根路由 - 健康檢查
app.get('/', (req, res) => {
  res.json({
    message: 'MES Backend API Server',
    status: 'running',
    timestamp: new Date().toISOString()
  })
})

// API 路由
app.use('/api', apiRoutes)

export default app
