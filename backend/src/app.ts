import express, { type Application } from 'express'
import cors from 'cors'
import { globalErrorHandler } from './middlewares/error.middleware.js'
import authRoutes from './routes/auth.routes.js'

const app: Application = express()

// Global Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use(globalErrorHandler)

export default app