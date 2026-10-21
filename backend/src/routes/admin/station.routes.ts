import { Router } from 'express'
import { stationController } from '../../controllers/admin/station.controller.js'
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware.js'

const router = Router()

// All routes are protected and require ADMIN role
router.post('/', authenticate, requireAdmin, stationController.create)
router.get('/', authenticate, requireAdmin, stationController.list)

export default router
