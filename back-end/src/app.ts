import { env } from './config/env.js'
import express from 'express'
import cookieParser from 'cookie-parser'
import { authMiddleware } from './middlewares/auth.middleware.js'
import authRoutes from './routes/auth.route.js'
import userRoutes from './routes/user.route.js'
import tenantRoutes from './routes/tenant.route.js'
import groupRoutes from './routes/group.route.js'
import reportRoutes from './routes/report.route.js'
import userGroupRoutes from './routes/userGroup.route.js'
import groupReportRoutes from './routes/groupReport.route.js'
import detailsRoute from './routes/details.route.js'
import pbiRoutes from './routes/pbi.route.js'
import cors from 'cors'

const app = express()

const corsOrigins = env.FRONTEND_URL
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.use(express.json())
app.use(cookieParser())

app.use('/api', authRoutes)
app.use('/api', authMiddleware)

app.use('/api', userRoutes)
app.use('/api', tenantRoutes)
app.use('/api', groupRoutes)
app.use('/api', reportRoutes)
app.use('/api', userGroupRoutes)
app.use('/api', groupReportRoutes)
app.use('/api', detailsRoute)
app.use('/api', pbiRoutes)

export default app
