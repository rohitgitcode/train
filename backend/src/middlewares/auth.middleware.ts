import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../utils/appError.js'
import { env } from '../config/env.js'
import { UserRole } from '../constants/roles.js'
import type { AuthUserPayload } from '../types/express.js'

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication token missing or invalid format', 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload
    req.user = decoded
    next()
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token has expired, please log in again', 401)
    }
    throw new AppError('Invalid token signature', 401)
  }
}

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Unauthorized: User context missing', 401)
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('Forbidden: You do not have permission to access this resource', 403)
    }

    next()
  }
}