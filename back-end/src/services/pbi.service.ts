import { prisma } from '../database/db.js'
import { decrypt } from '../utils/crypto.js'
import {
  getPowerBIAccessToken,
  generateEmbedToken,
  listWorkspaces,
  listReports
} from '../client/pbi.client.js'

async function getTenantAuthData(tenantId: number) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  })

  if (!tenant) {
    throw new Error('Tenant não encontrado')
  }

  if (
    !tenant.pbiTenantId ||
    !tenant.pbiClientId ||
    !tenant.pbiEmbeddedMode
  ) {
    throw new Error('Tenant sem configuração válida de Power BI')
  }

  return {
    pbiTenantId: decrypt(tenant.pbiTenantId),
    pbiClientId: decrypt(tenant.pbiClientId),

    pbiClientSecret: tenant.pbiClientSecret
      ? decrypt(tenant.pbiClientSecret)
      : undefined,

    pbiEmbeddedMode: tenant.pbiEmbeddedMode,

    pbiUser: tenant.pbiUser
      ? decrypt(tenant.pbiUser)
      : undefined,

    pbiPassword: tenant.pbiPassword
      ? decrypt(tenant.pbiPassword)
      : undefined,
  }
}

export async function generateTenantEmbedToken(
  tenantId: number,
  reportDatabaseId: number 
) {
  const tenant = await getTenantAuthData(tenantId)

  const report = await prisma.report.findFirst({
    where: {
      id: reportDatabaseId,
      tenantId,
    },
  })

  if (!report) {
    throw new Error('Relatório não encontrado ou não pertence a este tenant')
  }

  if (!report.reportId || !report.workspaceId) {
    throw new Error('Relatório sem reportId ou workspaceId configurado')
  }

  const accessToken = await getPowerBIAccessToken({
    tenantId: tenant.pbiTenantId,
    clientId: tenant.pbiClientId,
    clientSecret: tenant.pbiClientSecret ?? undefined,
    username: tenant.pbiUser ?? undefined,
    password: tenant.pbiPassword ?? undefined,
    embeddedMode: tenant.pbiEmbeddedMode,
  })

  const embedTokenData = await generateEmbedToken(
    accessToken,
    report.workspaceId,
    report.reportId
  )

  return {
    embedToken: embedTokenData.token,
    embedUrl: report.embedUrl,
    reportId: report.reportId,
    expiration: embedTokenData.expiration,
  }
}

export async function listTenantReports(tenantId: number) {
  const tenant = await getTenantAuthData(tenantId)

  const groups = await prisma.group.findMany({
    where: {
      tenantId,
      workspaceId: {
        not: null,
      },
    },
    select: {
      workspaceId: true,
    },
  })

  if (groups.length === 0) {
    return []
  }

  const accessToken = await getPowerBIAccessToken({
    tenantId: tenant.pbiTenantId,
    clientId: tenant.pbiClientId,
    clientSecret: tenant.pbiClientSecret ?? undefined,
    username: tenant.pbiUser ?? undefined,
    password: tenant.pbiPassword ?? undefined,
    embeddedMode: tenant.pbiEmbeddedMode,
  })

  const allReports = await Promise.all(
    groups.map(async (group) => {
      if (!group.workspaceId) return []
      
      try {
        const reports = await listReports(accessToken, group.workspaceId)
        return reports
      } catch (error) {
        console.error(`Erro ao buscar relatórios do workspace ${group.workspaceId}:`, error)
        return []
      }
    })
  )

  return allReports.flat()
}

export async function listTenantWorkspaces(tenantId: number) {
  const tenant = await getTenantAuthData(tenantId)

  const accessToken = await getPowerBIAccessToken({
    tenantId: tenant.pbiTenantId,
    clientId: tenant.pbiClientId,
    clientSecret: tenant.pbiClientSecret ?? undefined,
    username: tenant.pbiUser ?? undefined,
    password: tenant.pbiPassword ?? undefined,
    embeddedMode: tenant.pbiEmbeddedMode,
  })

  return listWorkspaces(accessToken)
}

