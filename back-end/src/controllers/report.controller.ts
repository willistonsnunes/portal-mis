import { Request, Response } from 'express'
import { ZodError } from 'zod'
import * as ReportService from '../services/report.service.js'
import { createReportSchema, updateReportSchema } from '../validators/report.schema.js'
import { UserRole } from '../database/generated/prisma/client.js'

export async function createReport(req: Request, res: Response) {
  try {
    const data = createReportSchema.parse(req.body)
    const report = await ReportService.createReport(data)
    return res.status(201).json(report)
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.issues })
    }
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function getReportById(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' })
    }

    const reportId = Number(req.params.id)
    const tenantIdValue = req.user.role === UserRole.SUPER_ADMIN
      ? req.query.tenantId
      : (req.query.tenantId ?? req.user?.tenantId)
    const tenantId = Number(tenantIdValue)
    const hasTenantId = !Number.isNaN(tenantId)

    if (Number.isNaN(reportId)) {
      return res.status(400).json({ message: 'Invalid reportId' })
    }

    if (req.user.role === UserRole.SUPER_ADMIN) {
      const report = hasTenantId
        ? await ReportService.getReportById(reportId, tenantId)
        : await ReportService.getReportByIdAny(reportId)
      if (!report) return res.status(404).json({ message: 'Report not found' })
      return res.json(report)
    }

    if (!hasTenantId) {
      return res.status(400).json({ message: 'Invalid tenantId' })
    }

    if (tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: 'Acesso fora do tenant' })
    }

    const report = req.user.role === UserRole.ADMIN
      ? await ReportService.getReportById(reportId, req.user.tenantId)
      : await ReportService.getReportByIdForUser(reportId, req.user.tenantId, req.user.id)
    if (!report) return res.status(404).json({ message: 'Report not found' })

    return res.json(report)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function listReports(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' })
    }

    const tenantId = req.user.role === UserRole.SUPER_ADMIN
      ? Number(req.query.tenantId)
      : Number(req.query.tenantId ?? req.user?.tenantId)

    if (req.user.role === UserRole.SUPER_ADMIN) {
      const reports = Number.isNaN(tenantId)
        ? await ReportService.listReportsAll()
        : await ReportService.listReportsByTenant(tenantId)
      return res.json(reports)
    }

    if (Number.isNaN(tenantId)) {
      return res.status(400).json({ message: 'Invalid tenantId' })
    }

    if (tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: 'Acesso fora do tenant' })
    }

    const reports = req.user.role === UserRole.ADMIN
      ? await ReportService.listReportsByTenant(req.user.tenantId)
      : await ReportService.listReportsForUser(req.user.tenantId, req.user.id)
    return res.json(reports)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function updateReport(req: Request, res: Response) {
  try {
    const reportId = Number(req.params.id)
    const tenantId = Number(req.body.tenantId ?? req.user?.tenantId)
    const data = updateReportSchema.parse(req.body)

    if (Number.isNaN(reportId) || Number.isNaN(tenantId)) {
      return res.status(400).json({ message: 'Invalid reportId or tenantId' })
    }

    const updated = await ReportService.updateReport(reportId, tenantId, data)
    return res.json(updated)
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.issues })
    }
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function deactivateReport(req: Request, res: Response) {
  try {
    const reportId = Number(req.params.id)
    const tenantId = Number(req.body.tenantId ?? req.user?.tenantId)

    if (Number.isNaN(reportId) || Number.isNaN(tenantId)) {
      return res.status(400).json({ message: 'Invalid reportId or tenantId' })
    }

    await ReportService.deactivateReport(reportId, tenantId)
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

