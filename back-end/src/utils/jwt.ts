import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export interface AccessTokenPayload {
  id: number
  name: string
  email: string
  username: string
  role: string
  type: string
  tenantId: number
  isActive: boolean
}

export interface RefreshTokenPayload {
  id: number
}

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '15m',
  })
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload
}

export function signRefreshToken(userId: number) {
  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: '4h',
  })
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload
}
