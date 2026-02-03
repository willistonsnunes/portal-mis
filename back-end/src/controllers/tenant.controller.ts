import { Request, Response } from 'express'
import * as TenantService from '../services/tenant.service.js'
import { createTenantSchema, updateTenantSchema } from '../validators/tenant.schema.js'
import { UserRole } from '../database/generated/prisma/client.js'

export async function createTenant(req: Request, res: Response) {
  try {
    const validated = createTenantSchema.parse(req.body)
    const tenant = await TenantService.createTenant(validated)
    return res.status(201).json(tenant)
  } catch (err: any) {
    console.error('Erro ao criar tenant:', err)
    return res.status(500).json({ message: 'Erro ao criar tenant', detail: err.message })
  }
}

export async function getTenantById(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' })
    }

    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Id inválido' })
    }

    if (req.user.role !== UserRole.SUPER_ADMIN) {
      if (!req.user.tenantId) {
        return res.status(400).json({ message: 'Tenant do usuário não definido' })
      }
      if (id !== req.user.tenantId) {
        return res.status(403).json({ message: 'Acesso fora do tenant' })
      }
    }

    const tenant = await TenantService.getTenantById(id)
    if (!tenant) return res.status(404).json({ message: 'Tenant não encontrado' })
    return res.json(tenant)
  } catch (err: any) {
    console.error('Erro ao buscar tenant:', err)
    return res.status(500).json({ message: 'Erro ao buscar tenant', detail: err.message })
  }
}

export async function listTenants(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' })
    }

    if (req.user.role === UserRole.SUPER_ADMIN) {
      const tenants = await TenantService.listTenants()
      return res.json(tenants)
    }

    if (!req.user.tenantId) {
      return res.status(400).json({ message: 'Tenant do usuário não definido' })
    }

    const tenant = await TenantService.getTenantById(req.user.tenantId)
    return res.json(tenant ? [tenant] : [])
  } catch (err: any) {
    console.error('Erro ao listar tenants:', err)
    return res.status(500).json({ message: 'Erro ao listar tenants', detail: err.message })
  }
}

export async function updateTenant(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' })
    }

    const validated = updateTenantSchema.parse(req.body)
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Id inválido' })
    }

    if (req.user.role !== UserRole.SUPER_ADMIN) {
      if (!req.user.tenantId) {
        return res.status(400).json({ message: 'Tenant do usuário não definido' })
      }
      if (id !== req.user.tenantId) {
        return res.status(403).json({ message: 'Acesso fora do tenant' })
      }
    }

    const tenant = await TenantService.updateTenant(id, validated)
    return res.json(tenant)
  } catch (err: any) {
    console.error('Erro ao atualizar tenant:', err)
    return res.status(500).json({ message: 'Erro ao atualizar tenant', detail: err.message })
  }
}

export async function deactivateTenant(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const tenant = await TenantService.deactivateTenant(id)
    return res.json({ message: 'Tenant desativado com sucesso', tenant })
  } catch (err: any) {
    console.error('Erro ao desativar tenant:', err)
    return res.status(500).json({ message: 'Erro ao desativar tenant', detail: err.message })
  }
}
