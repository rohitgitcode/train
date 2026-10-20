import { UserRole } from '../constants/roles.js'

export interface AuthUserPayload {
  id: number
  email: string
  role: UserRole
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload
    }
  }
}