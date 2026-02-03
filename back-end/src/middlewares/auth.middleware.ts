import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.accessToken

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado' })
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: number
      role: string
      tenantId: number
    }

    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' })
  }
}

