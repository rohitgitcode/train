import { Router } from 'express'
import { TrainController } from '../controllers/train.controller.js'

const router = Router()

// Public route: search trains by ?from=ADI&to=BCT&date=YYYY-MM-DD
router.get('/search', TrainController.search)

// Public route: train stop schedule by train ID
router.get('/:id/schedule', TrainController.getSchedule)

export default router
