import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { UserRole } from '../database/generated/prisma/client.js'
import * as UserGroupService from '../services/userGroup.service.js'
import { createUserGroupSchema, updateUserGroupSchema } from '../validators/userGroup.schema.js'

function resolveTenantId(req: Request, includeUserTenant: boolean = true) {
  const tenantId = Number(req.query.tenantId ?? req.body.tenantId ?? (includeUserTenant ? req.user?.tenantId : undefined))
  return Number.isNaN(tenantId) ? null : tenantId
}

export async function createUserGroup(req: Request, res: Response) {
  try {
    const data = createUserGroupSchema.parse(req.body)
    const tenantId = req.user.role === UserRole.SUPER_ADMIN
      ? resolveTenantId(req, false)
      : resolveTenantId(req, true)

    if (!tenantId) return res.status(400).json({ message: 'tenantId é obrigatório' })

    const userGroup = await UserGroupService.createUserGroup(data, tenantId)
    return res.status(201).json(userGroup)
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.issues })
    }
    if (err instanceof Error && err.message.includes('não encontrado no tenant')) {
      return res.status(404).json({ message: err.message })
    }
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function listUserGroups(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' })
    }

    const tenantId = resolveTenantId(req)

    if (req.user.role === UserRole.SUPER_ADMIN) {
      const userGroups = tenantId
        ? await UserGroupService.listUserGroups(tenantId)
        : await UserGroupService.listUserGroupsAll()
      return res.json(userGroups)
    }

    if (!tenantId) return res.status(400).json({ message: 'tenantId é obrigatório' })

    if (tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: 'Acesso fora do tenant' })
    }

    const userGroups = req.user.role === UserRole.ADMIN
      ? await UserGroupService.listUserGroups(req.user.tenantId)
      : await UserGroupService.listUserGroupsForUser(req.user.tenantId, req.user.id)
    return res.json(userGroups)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function getUserGroupById(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' })
    }

    const userId = Number(req.params.userId)
    const groupId = Number(req.params.groupId)
    const tenantId = resolveTenantId(req)

    if (Number.isNaN(userId) || Number.isNaN(groupId)) return res.status(400).json({ message: 'Invalid IDs' })
    if (!tenantId) return res.status(400).json({ message: 'tenantId é obrigatório' })

    if (req.user.role !== UserRole.SUPER_ADMIN && tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: 'Acesso fora do tenant' })
    }

    if (req.user.role === UserRole.USER && userId !== req.user.id) {
      return res.status(403).json({ message: 'Acesso fora do vínculo' })
    }

    const userGroup = await UserGroupService.getUserGroup(userId, groupId, tenantId)
    if (!userGroup) return res.status(404).json({ message: 'UserGroup not found' })

    return res.json(userGroup)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function deleteUserGroup(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId)
    const groupId = Number(req.params.groupId)
    const tenantId = resolveTenantId(req)

    if (Number.isNaN(userId) || Number.isNaN(groupId)) return res.status(400).json({ message: 'Invalid IDs' })
    if (!tenantId) return res.status(400).json({ message: 'tenantId é obrigatório' })

    const deleted = await UserGroupService.deleteUserGroup(userId, groupId, tenantId)
    if (!deleted) return res.status(404).json({ message: 'UserGroup not found' })

    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

