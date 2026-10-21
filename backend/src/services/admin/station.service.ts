import Station from '../../models/Station.js'
import { AppError } from '../../utils/appError.js'
import type { CreateStationDTO } from '../../validators/station.validator.js'

export class StationService {
  /**
   * Create a new station
   * Formats code/name, checks duplicate in DB, and saves via Lucid ORM
   */
  public async createStation(payload: CreateStationDTO): Promise<Station> {
    const formattedCode = payload.code.trim().toUpperCase()
    const formattedName = payload.name.trim()

    // Check if station code already exists in DB
    const existingStation = await Station.findBy('code', formattedCode)
    if (existingStation) {
      throw new AppError(`Station with code '${formattedCode}' already exists`, 409)
    }

    // Create station in database via Lucid ORM
    const station = await Station.create({
      code: formattedCode,
      name: formattedName,
    })

    return station
  }

  /**
   * Fetch all stations in alphabetical order by name
   */
  public async getAllStations(): Promise<Station[]> {
    return Station.query().orderBy('name', 'asc')
  }
}

export const stationService = new StationService()
