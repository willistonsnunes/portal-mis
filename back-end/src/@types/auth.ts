import { UserRole } from '../database/generated/prisma/client.js'

export interface AuthUser {
  id: number
  role: UserRole
  tenantId: number
}
