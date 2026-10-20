import type { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service.js'
import { registerSchema, loginSchema } from '../validators/auth.validator.js'

const authService = new AuthService()

export class AuthController {

  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {

    try {
      const validatedData = registerSchema.parse(req.body)
      const result = await authService.register(validatedData)

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const validatedData = loginSchema.parse(req.body)
      const result = await authService.login(validatedData)

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
}