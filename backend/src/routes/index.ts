import { Router } from 'express'
import authRoutes from './auth.routes.js'
import adminStationRoutes from './admin/station.routes.js'
import trainRoutes from './train.routes.js'
import bookingRoutes from './booking.routes.js'

const rootRouter = Router()

rootRouter.use('/auth', authRoutes)
rootRouter.use('/admin/stations', adminStationRoutes)
rootRouter.use('/trains', trainRoutes)
rootRouter.use('/bookings', bookingRoutes)

export default rootRouter
