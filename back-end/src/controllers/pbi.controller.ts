import { Request, Response } from 'express'
import {
  listTenantReports,
  generateTenantEmbedToken,
  listTenantWorkspaces
} from '../services/pbi.service.js'

export async function generateEmbedController(
  req: Request,
  res: Response
) {
  try {
    const tenantId = req.user!.tenantId
    const { id } = req.params

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        message: 'reportId inválido',
      })
    }

    const reportDatabaseId = Number(id)

    if (isNaN(reportDatabaseId)) {
      return res.status(400).json({
        message: 'reportId deve ser um número',
      })
    }

    const embedInfo = await generateTenantEmbedToken(
      tenantId,
      reportDatabaseId
    )

    return res.json(embedInfo)
  } catch (error: any) {
    return res.status(500).json({
      message: 'Erro ao gerar embed token',
      error: error.message
    })
  }
}

export async function getTenantWorkspacesController(
  req: Request,
  res: Response
) {
  try {
    const tenantId = Number(req.user?.tenantId)

    if (!tenantId || isNaN(tenantId)) {
      return res.status(401).json({ message: 'Tenant não identificado' })
    }

    const workspaces = await listTenantWorkspaces(tenantId)

    return res.json(workspaces)
  } catch (error: any) {
    return res.status(500).json({
      message: 'Erro ao buscar workspaces',
      error: error.message
    })
  }
}

export async function listReportsController(
  req: Request,
  res: Response
) {
  try {
    const tenantId = req.user!.tenantId

    const reports = await listTenantReports(tenantId)

    return res.json(reports)
  } catch (error: any) {
    return res.status(500).json({
      message: 'Erro ao listar reports da API do Power BI',
      error: error.message
    })
  }
}

