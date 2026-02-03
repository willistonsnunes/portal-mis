import { Request, Response, NextFunction } from 'express'
import { UserRole } from '../database/generated/prisma/client.js'

export function requireAdminOrSuper(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autenticado' })
  }

  if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: 'Permissão negada' })
  }

  const tenantIdRaw =
    req.body?.tenantId ??
    req.query?.tenantId ??
    req.params?.tenantId
  const tenantId = tenantIdRaw !== undefined ? Number(tenantIdRaw) : undefined

  if (tenantId !== undefined && Number.isNaN(tenantId)) {
    return res.status(400).json({ message: 'tenantId inválido' })
  }

  if (req.user.role !== UserRole.SUPER_ADMIN && tenantId && req.user.tenantId !== tenantId) {
    return res.status(403).json({ message: 'Acesso fora do tenant' })
  }

  next()
}

export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autenticado' })
  }

  if (req.user.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ message: 'Permissão negada' })
  }

  next()
}
