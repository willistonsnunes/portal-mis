import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { UserRole } from '../database/generated/prisma/client.js'
import * as GroupReportService from '../services/groupReport.service.js'
import { createGroupReportSchema, updateGroupReportSchema } from '../validators/groupReport.schema.js'

function resolveTenantId(req: Request, includeUserTenant: boolean = true) {
  const tenantId = Number(req.query.tenantId ?? req.body.tenantId ?? (includeUserTenant ? req.user?.tenantId : undefined))
  return Number.isNaN(tenantId) ? null : tenantId
}

export async function createGroupReport(req: Request, res: Response) {
  try {
    const data = createGroupReportSchema.parse(req.body)
    const tenantId = req.user.role === UserRole.SUPER_ADMIN
      ? resolveTenantId(req, false)
      : resolveTenantId(req, true)

    if (!tenantId) return res.status(400).json({ message: 'tenantId é obrigatório' })

    const groupReport = await GroupReportService.createGroupReport(data, tenantId)
    return res.status(201).json(groupReport)
  } catch (err) {
    if (err instanceof ZodError) return res.status(400).json({ message: 'Validation error', errors: err.issues })
    if (err instanceof Error && err.message.includes('não encontrado no tenant')) {
      return res.status(404).json({ message: err.message })
    }
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function listGroupReports(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' })
    }

    const tenantId = resolveTenantId(req)

    if (req.user.role === UserRole.SUPER_ADMIN) {
      const groupReports = tenantId
        ? await GroupReportService.listGroupReports(tenantId)
        : await GroupReportService.listGroupReportsAll()
      return res.json(groupReports)
    }

    if (!tenantId) return res.status(400).json({ message: 'tenantId é obrigatório' })

    if (tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: 'Acesso fora do tenant' })
    }

    const groupReports = req.user.role === UserRole.ADMIN
      ? await GroupReportService.listGroupReports(req.user.tenantId)
      : await GroupReportService.listGroupReportsForUser(req.user.tenantId, req.user.id)
    return res.json(groupReports)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function getGroupReportById(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' })
    }

    const groupId = Number(req.params.groupId)
    const reportId = Number(req.params.reportId)
    const tenantId = resolveTenantId(req)

    if (Number.isNaN(groupId) || Number.isNaN(reportId)) return res.status(400).json({ message: 'Invalid IDs' })
    if (!tenantId) return res.status(400).json({ message: 'tenantId é obrigatório' })

    if (req.user.role !== UserRole.SUPER_ADMIN && tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: 'Acesso fora do tenant' })
    }

    const groupReport = req.user.role === UserRole.ADMIN
      ? await GroupReportService.getGroupReport(groupId, reportId, tenantId)
      : await GroupReportService.getGroupReportForUser(groupId, reportId, tenantId, req.user.id)
    if (!groupReport) return res.status(404).json({ message: 'GroupReport not found' })

    return res.json(groupReport)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function deleteGroupReport(req: Request, res: Response) {
  try {
    const groupId = Number(req.params.groupId)
    const reportId = Number(req.params.reportId)
    const tenantId = resolveTenantId(req)

    if (Number.isNaN(groupId) || Number.isNaN(reportId)) return res.status(400).json({ message: 'Invalid IDs' })
    if (!tenantId) return res.status(400).json({ message: 'tenantId é obrigatório' })

    const deleted = await GroupReportService.deleteGroupReport(groupId, reportId, tenantId)
    if (!deleted) return res.status(404).json({ message: 'GroupReport not found' })

    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

