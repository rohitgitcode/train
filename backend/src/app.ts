import express, { type Application } from 'express'
import cors from 'cors'
import { globalErrorHandler } from './middlewares/error.middleware.js'
import rootRouter from './routes/index.js'

const app: Application = express()

// Global Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Central API Router (Mounts /auth, /admin/stations, /trains, /bookings under /api)
app.use('/api', rootRouter)

// Global Error Handler
app.use(globalErrorHandler)

export default app