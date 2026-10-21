import type { Request, Response, NextFunction } from 'express'
import { stationService } from '../../services/admin/station.service.js'
import { createStationSchema } from '../../validators/station.validator.js'

export class StationController {
  /**
   * Create a new station
   * POST /api/admin/stations
   */
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate incoming request body with Zod schema
      const validatedData = createStationSchema.parse(req.body)

      // Call service layer for business logic & DB operations
      const station = await stationService.createStation(validatedData)

      res.status(201).json({
        success: true,
        message: 'Station created successfully',
        data: station,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * List all stations ordered alphabetically by name
   * GET /api/admin/stations
   */
  public static async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stations = await stationService.getAllStations()

      res.status(200).json({
        success: true,
        message: 'Stations fetched successfully',
        data: stations,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const stationController = {
  create: StationController.create,
  list: StationController.list,
}

export default StationController
