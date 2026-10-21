import Station from '../models/Station.js'
import Train from '../models/Train.js'
import TrainSchedule from '../models/TrainSchedule.js'
import SeatInventory from '../models/SeatInventory.js'
import { AppError } from '../utils/appError.js'
import { db } from '../config/database.js'

// Realistic base fare matrix per coach type (Indian Railways baseline)
const BASE_FARE: Record<string, number> = {
  '1A': 1500,
  '2A': 1000,
  '3A': 700,
  'CC': 450,
  'SL': 250,
  '2S': 120,
}

const FARE_PER_KM: Record<string, number> = {
  '1A': 2.2,
  '2A': 1.5,
  '3A': 1.0,
  'CC': 0.8,
  'SL': 0.4,
  '2S': 0.2,
}

export class TrainService {
  /**
   * Search trains running between source and destination stations on a specific journey date
   */
  public async searchTrains(fromStationCode: string, toStationCode: string, journeyDate: string) {
    const formattedFrom = fromStationCode.trim().toUpperCase()
    const formattedTo = toStationCode.trim().toUpperCase()

    // 1. Find Source and Destination stations
    const fromStation = await Station.findBy('code', formattedFrom)
    if (!fromStation) {
      throw new AppError(`Source station '${formattedFrom}' not found`, 404)
    }

    const toStation = await Station.findBy('code', formattedTo)
    if (!toStation) {
      throw new AppError(`Destination station '${formattedTo}' not found`, 404)
    }

    if (fromStation.id === toStation.id) {
      throw new AppError('Source and Destination stations cannot be identical', 400)
    }

    // 2. Query trains where both stations exist as stops and fromSeq < toSeq (directional validation)
    const matchingTrains: any[] = await db
      .from('trains as t')
      .join('train_schedules as s1', (join) => {
        join.on('t.id', 's1.train_id').andOnVal('s1.station_id', fromStation.id)
      })
      .join('train_schedules as s2', (join) => {
        join.on('t.id', 's2.train_id').andOnVal('s2.station_id', toStation.id)
      })
      .where('t.is_active', true)
      .whereRaw('s1.stop_sequence < s2.stop_sequence')
      .select(
        't.id as train_id',
        't.train_number',
        't.name as train_name',
        't.type as train_type',
        's1.departure_time as departure_time',
        's2.arrival_time as arrival_time',
        's1.stop_sequence as from_sequence',
        's2.stop_sequence as to_sequence',
        db.raw('GREATEST(0, s2.distance_from_source_km - s1.distance_from_source_km) as distance_km')
      )

    if (matchingTrains.length === 0) {
      return {
        fromStation: { id: fromStation.id, code: fromStation.code, name: fromStation.name },
        toStation: { id: toStation.id, code: toStation.code, name: toStation.name },
        journeyDate,
        totalTrains: 0,
        trains: [],
      }
    }

    // 3. Fetch SeatInventory for all matching trains on the given journeyDate
    const trainIds = matchingTrains.map((t) => t.train_id)
    const inventories = await SeatInventory.query()
      .whereIn('trainId', trainIds)
      .where('journeyDate', journeyDate)

    // Group inventories by trainId
    const inventoryMap = new Map<number, SeatInventory[]>()
    for (const inv of inventories) {
      const existing = inventoryMap.get(inv.trainId) || []
      existing.push(inv)
      inventoryMap.set(inv.trainId, existing)
    }

    // 4. Construct response with available seats and calculated fares
    const trainsWithAvailability = matchingTrains.map((train) => {
      const trainInventories = inventoryMap.get(train.train_id) || []
      const distance = Number(train.distance_km) || 100

      const seatAvailability = trainInventories.map((inv) => {
        const base = BASE_FARE[inv.coachType] || 300
        const perKm = FARE_PER_KM[inv.coachType] || 0.4
        const fare = Math.round(base + distance * perKm)

        return {
          id: inv.id,
          coachType: inv.coachType,
          quota: inv.quota,
          totalSeats: inv.totalSeats,
          availableSeats: inv.availableSeats,
          fare,
        }
      })

      return {
        trainId: train.train_id,
        trainNumber: train.train_number,
        name: train.train_name,
        type: train.train_type,
        departureTime: train.departure_time,
        arrivalTime: train.arrival_time,
        distanceKm: distance,
        availableCoaches: seatAvailability,
      }
    })

    return {
      fromStation: { id: fromStation.id, code: fromStation.code, name: fromStation.name },
      toStation: { id: toStation.id, code: toStation.code, name: toStation.name },
      journeyDate,
      totalTrains: trainsWithAvailability.length,
      trains: trainsWithAvailability,
    }
  }

  /**
   * Get complete station stop schedule for a train in sequence order
   */
  public async getTrainSchedule(trainId: number) {
    const train = await Train.find(trainId)
    if (!train) {
      throw new AppError(`Train with ID '${trainId}' not found`, 404)
    }

    const schedules = await TrainSchedule.query()
      .where('trainId', trainId)
      .preload('station')
      .orderBy('stopSequence', 'asc')

    return {
      train: {
        id: train.id,
        trainNumber: train.trainNumber,
        name: train.name,
        type: train.type,
      },
      totalStops: schedules.length,
      stops: schedules.map((stop) => ({
        stopSequence: stop.stopSequence,
        stationId: stop.stationId,
        stationCode: stop.station?.code ?? null,
        stationName: stop.station?.name ?? null,
        arrivalTime: stop.arrivalTime,
        departureTime: stop.departureTime,
        dayCount: stop.dayCount,
        distanceFromSourceKm: Number(stop.distanceFromSourceKm),
      })),
    }
  }
}

export const trainService = new TrainService()
