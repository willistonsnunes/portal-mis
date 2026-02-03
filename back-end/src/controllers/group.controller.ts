import { Request, Response } from 'express'
import * as groupService from '../services/group.service.js'
import { createGroupSchema, updateGroupSchema } from '../validators/group.schema.js'
import { UserRole } from '../database/generated/prisma/client.js'

export async function createGroup(req: Request, res: Response) {
  try {
    const validated = createGroupSchema.parse(req.body)
    const group = await groupService.createGroup(validated)
    res.status(201).json(group)
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ errors: err.message })
    }
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar grupo' })
  }
}

export async function listGroups(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' })
    }

    const tenantId = req.user.role === UserRole.SUPER_ADMIN
      ? Number(req.query.tenantId)
      : Number(req.query.tenantId ?? req.user?.tenantId)

    if (req.user.role === UserRole.SUPER_ADMIN) {
      const groups = Number.isNaN(tenantId)
        ? await groupService.listGroupsAll()
        : await groupService.listGroupsByTenant(tenantId)
      return res.json(groups)
    }

    if (!tenantId) return res.status(400).json({ error: 'tenantId é obrigatório' })

    if (tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: 'Acesso fora do tenant' })
    }

    const groups = req.user.role === UserRole.ADMIN
      ? await groupService.listGroupsByTenant(req.user.tenantId)
      : await groupService.listGroupsForUser(req.user.tenantId, req.user.id)
    res.json(groups)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao listar grupos' })
  }
}

export async function getGroupById(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' })
    }

    const groupId = Number(req.params.id)
    const tenantId = req.user.role === UserRole.SUPER_ADMIN
      ? Number(req.query.tenantId)
      : Number(req.query.tenantId ?? req.user?.tenantId)

    if (req.user.role === UserRole.SUPER_ADMIN) {
      const group = Number.isNaN(tenantId)
        ? await groupService.getGroupByIdAny(groupId)
        : await groupService.getGroupById(groupId, tenantId)
      if (!group) return res.status(404).json({ error: 'Grupo não encontrado' })
      return res.json(group)
    }

    if (!tenantId) return res.status(400).json({ error: 'tenantId é obrigatório' })

    if (tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: 'Acesso fora do tenant' })
    }

    const group = req.user.role === UserRole.ADMIN
      ? await groupService.getGroupById(groupId, tenantId)
      : await groupService.getGroupByIdForUser(groupId, tenantId, req.user.id)
    if (!group) return res.status(404).json({ error: 'Grupo não encontrado' })

    res.json(group)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar grupo' })
  }
}

export async function updateGroup(req: Request, res: Response) {
  try {
    const groupId = Number(req.params.id)
    const tenantId = Number(req.query.tenantId ?? req.user?.tenantId)
    if (!tenantId) return res.status(400).json({ error: 'tenantId é obrigatório' })

    const data = updateGroupSchema.parse(req.body)
    const result = await groupService.updateGroup(groupId, tenantId, data)

    if (result.count === 0) return res.status(404).json({ error: 'Grupo não encontrado' })
    res.json({ message: 'Grupo atualizado com sucesso' })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ errors: err.errors })
    }
    console.error(err)
    res.status(500).json({ error: 'Erro ao atualizar grupo' })
  }
}

export async function deactivateGroup(req: Request, res: Response) {
  try {
    const groupId = Number(req.params.id)
    const tenantId = Number(req.query.tenantId ?? req.user?.tenantId)
    if (!tenantId) return res.status(400).json({ error: 'tenantId é obrigatório' })

    const result = await groupService.deactivateGroup(groupId, tenantId)
    if (result.count === 0) return res.status(404).json({ error: 'Grupo não encontrado' })

    res.json({ message: 'Grupo desativado com sucesso' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao desativar grupo' })
  }
}


