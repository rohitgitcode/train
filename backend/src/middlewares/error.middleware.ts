import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../utils/appError.js'
import { env } from '../config/env.js'

export function globalErrorHandler(
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500
  let message = 'Internal Server Error'
  let errors: any = undefined


  if (err instanceof ZodError) {
    statusCode = 400
    message = 'Validation failed'
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
  } else if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
  } else if (env.NODE_ENV === 'development') {
    message = err.message
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(env.NODE_ENV === 'development' && !(err instanceof ZodError) && { stack: err.stack }),
  })
}