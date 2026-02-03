import { UserRole } from '../database/generated/prisma/client.js'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        role: UserRole
        tenantId: number
      }
    }
  }
}

export {}
