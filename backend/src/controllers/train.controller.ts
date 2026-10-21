import type { Request, Response, NextFunction } from 'express'
import { trainService } from '../services/train.service.js'
import { searchTrainsQuerySchema } from '../validators/train.validator.js'
import { AppError } from '../utils/appError.js'

export class TrainController {
  /**
   * Search trains between stations on a specific date
   * GET /api/trains/search?from=ADI&to=BCT&date=YYYY-MM-DD
   */
  public static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Validate query parameters via Zod schema
      const { from, to, date } = searchTrainsQuerySchema.parse(req.query)

      // 2. Execute service logic
      const result = await trainService.searchTrains(from, to, date)

      res.status(200).json({
        success: true,
        message: 'Trains searched successfully',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get complete stop schedule of a train
   * GET /api/trains/:id/schedule
   */
  public static async getSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trainId = Number(req.params.id)

      if (!trainId || isNaN(trainId) || trainId <= 0) {
        throw new AppError('Invalid or missing train ID parameter', 400)
      }

      const schedule = await trainService.getTrainSchedule(trainId)

      res.status(200).json({
        success: true,
        message: 'Train schedule fetched successfully',
        data: schedule,
      })
    } catch (error) {
      next(error)
    }
  }
}

export default TrainController
