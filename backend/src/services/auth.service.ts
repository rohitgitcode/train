import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { AppError } from '../utils/appError.js'
import { env } from '../config/env.js'
import { UserRole } from '../constants/roles.js'
import type { RegisterDTO, LoginDTO } from '../validators/auth.validator.js'

export class AuthService {

  private generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN as any,
      }
    )
  }

  public async register(payload: RegisterDTO) {
    const existingUser = await User.findBy('email', payload.email)
    if (existingUser) {
      throw new AppError('Email is already registered', 409)
    }

    const user = new User()
    user.fullName = payload.fullName
    user.email = payload.email
    user.password = payload.password 
    user.role = UserRole.CUSTOMER

    await user.save()

    // JWT Token generate karo
    const token = this.generateToken(user)

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    }
  }

  // Login 
  public async login(payload: LoginDTO) {
    const user = await User.findBy('email', payload.email)
    if (!user) {
      throw new AppError('Invalid email or password', 401)
    }

    const isPasswordValid = await user.verifyPassword(payload.password)
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401)
    }
    const token = this.generateToken(user)

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    }
  }
}