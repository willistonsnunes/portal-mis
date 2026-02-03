import { Request, Response } from 'express'
import { ZodError } from 'zod'

import * as UserService from '../services/user.service.js'
import { UserRole } from '../database/generated/prisma/client.js'
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
} from '../validators/user.schema.js'

export async function createUser(req: Request, res: Response) {
  try {
    const data = createUserSchema.parse(req.body)

    const user = await UserService.createUser(data)

    return res.status(201).json(user)
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: err.issues,
      })
    }

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' })
    }

    const userId = Number(req.params.id)
    const tenantId = req.user.role === UserRole.SUPER_ADMIN
      ? Number(req.query.tenantId)
      : Number(req.query.tenantId ?? req.user?.tenantId)

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid ID' })
    }

    if (req.user.role === UserRole.SUPER_ADMIN) {
      const user = Number.isNaN(tenantId)
        ? await UserService.getUserByIdAny(userId)
        : await UserService.getUserById(userId, tenantId)
      if (!user) return res.status(404).json({ message: 'User not found' })
      return res.json(user)
    }

    if (Number.isNaN(tenantId)) {
      return res.status(400).json({ message: 'Invalid tenantId' })
    }

    if (tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: 'Acesso fora do tenant' })
    }

    const user = await UserService.getUserById(userId, tenantId)

    if (!user) return res.status(404).json({ message: 'User not found' })

    return res.json(user)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function listUsers(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' })
    }

    const tenantId = req.user.role === UserRole.SUPER_ADMIN
      ? Number(req.query.tenantId)
      : Number(req.query.tenantId ?? req.user?.tenantId)

    if (req.user.role === UserRole.SUPER_ADMIN) {
      const users = Number.isNaN(tenantId)
        ? await UserService.listUsersAll()
        : await UserService.listUsersByTenant(tenantId)
      return res.json(users)
    }

    if (Number.isNaN(tenantId)) {
      return res.status(400).json({ message: 'Invalid tenantId' })
    }

    const users = await UserService.listUsersByTenant(req.user.tenantId)

    return res.json(users)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id)
    const tenantId = Number(req.body.tenantId ?? req.user?.tenantId) // tenant do usuário logado ou enviado
    const data = updateUserSchema.parse(req.body)

    if (Number.isNaN(userId) || Number.isNaN(tenantId)) {
      return res.status(400).json({ message: 'Invalid ID or tenantId' })
    }

    const updated = await UserService.updateUser(userId, tenantId, data)

    return res.json(updated)
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.issues })
    }
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function deactivateUser(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id)
    const tenantId = Number(req.body.tenantId ?? req.user?.tenantId)

    if (Number.isNaN(userId) || Number.isNaN(tenantId)) {
      return res.status(400).json({ message: 'Invalid ID or tenantId' })
    }

    await UserService.deactivateUser(userId, tenantId)

    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id)
    const { password } = resetPasswordSchema.parse(req.body)

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid userId' })
    }

    const user = await UserService.resetUserPassword(userId, password)

    return res.json(user)
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: err.issues,
      })
    }

    console.error(err)
    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

