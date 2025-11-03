import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware'
import { accessMiddleware } from './middleware/access.middleware'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Access code middleware (applies to all routes except /api/access)
app.use(accessMiddleware)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Import routes
import accessRoutes from './routes/access.routes'
import walletRoutes from './routes/wallet.routes'
import postsRoutes from './routes/posts.routes'
import commentsRoutes from './routes/comments.routes'
import rankingsRoutes from './routes/rankings.routes'
import tipsRoutes from './routes/tips.routes'
import prizesRoutes from './routes/prizes.routes'
import uploadRoutes from './routes/upload.routes'

// API Routes
app.use('/api/access', accessRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/comments', commentsRoutes)
app.use('/api/rankings', rankingsRoutes)
app.use('/api/tips', tipsRoutes)
app.use('/api/prizes', prizesRoutes)
app.use('/api/upload', uploadRoutes)

// Error handlers
app.use(notFoundMiddleware)
app.use(errorMiddleware)

// Start server
app.listen(PORT, () => {
  console.log('🚀 Gimme Idea Backend Server')
  console.log(`📡 Server running on http://localhost:${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔐 Access code: ${process.env.ACCESS_CODE || 'GMI2025'}`)
  console.log(`⚡ Ready to accept connections!`)
})

export default app
