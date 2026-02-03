import { prisma } from '../database/db.js'

export interface CreateReportDTO {
  name: string
  description?: string
  workspaceId?: string
  reportId?: string
  embedUrl?: string
  reportKey: string
  tenantId: number
}

export interface UpdateReportDTO {
  name?: string
  description?: string
  workspaceId?: string
  reportId?: string
  embedUrl?: string
  reportKey?: string
  isActive?: boolean
}

export async function createReport(data: CreateReportDTO) {
  return prisma.report.create({
    data: {
      ...data
    },
    select: {
      id: true,
      name: true,
      description: true,
      workspaceId: true,
      reportId: true,
      embedUrl: true,
      reportKey: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function getReportById(reportId: number, tenantId: number) {
  return prisma.report.findFirst({
    where: { id: reportId, tenantId, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      workspaceId: true,
      reportId: true,
      embedUrl: true,
      reportKey: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function getReportByIdAny(reportId: number) {
  return prisma.report.findFirst({
    where: { id: reportId, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      workspaceId: true,
      reportId: true,
      embedUrl: true,
      reportKey: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function getReportByIdForUser(reportId: number, tenantId: number, userId: number) {
  return prisma.report.findFirst({
    where: {
      id: reportId,
      tenantId,
      isActive: true,
      groups: {
        some: {
          group: {
            users: {
              some: {
                userId,
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      workspaceId: true,
      reportId: true,
      embedUrl: true,
      reportKey: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function listReportsByTenant(tenantId: number) {
  return prisma.report.findMany({
    where: { tenantId, isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      workspaceId: true,
      reportId: true,
      embedUrl: true,
      reportKey: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function listReportsAll() {
  return prisma.report.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      workspaceId: true,
      reportId: true,
      embedUrl: true,
      reportKey: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function listReportsForUser(tenantId: number, userId: number) {
  return prisma.report.findMany({
    where: {
      tenantId,
      isActive: true,
      groups: {
        some: {
          group: {
            users: {
              some: {
                userId,
              },
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      workspaceId: true,
      reportId: true,
      embedUrl: true,
      reportKey: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function updateReport(reportId: number, tenantId: number, data: UpdateReportDTO) {
  const updateData: any = { ...data }
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] === undefined) delete updateData[key]
  })

  return prisma.report.updateMany({
    where: { id: reportId, tenantId },
    data: updateData,
  })
}

export async function deactivateReport(reportId: number, tenantId: number) {
  return prisma.report.updateMany({
    where: { id: reportId, tenantId },
    data: { isActive: false },
  })
}
