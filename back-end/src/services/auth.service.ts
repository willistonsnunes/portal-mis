import { prisma } from '../database/db.js'
import bcrypt from 'bcryptjs'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type AccessTokenPayload
} from '../utils/jwt.js'

export interface LoginDTO {
  login: string
  password: string
}

type SafeUser = Omit<{
  id: number
  name: string
  email: string
  username: string
  role: string
  type: string
  tenantId: number
  isActive: boolean
}, 'password'>

export async function login({ login, password }: LoginDTO) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: login }, { email: login }]
    },
  })

  if (!user) {
    return { status: 'not_found' as const }
  }

  if (!user.isActive) {
    return { status: 'inactive' as const }
  }

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    return { status: 'invalid' as const }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  })

  const { password: _, ...userSafe } = user

  const accessToken = signAccessToken(userSafe as AccessTokenPayload)
  const refreshToken = signRefreshToken(user.id)

  return { status: 'ok' as const, user: userSafe as SafeUser, accessToken, refreshToken }
}

export async function refreshToken(token: string) {
  try {
    const payload = verifyRefreshToken(token)

    const user = await prisma.user.findUnique({
      where: { id: payload.id, isActive: true },
    })

    if (!user) return null

    const { password: _, ...userSafe } = user

    const accessToken = signAccessToken(userSafe as AccessTokenPayload)
    const newRefreshToken = signRefreshToken(user.id)

    return { accessToken, refreshToken: newRefreshToken, user: userSafe as SafeUser }
  } catch {
    return null
  }
}

export function logout() {
  return true
}
