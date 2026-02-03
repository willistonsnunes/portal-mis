import { prisma } from '../database/db.js'

export interface CreateGroupReportDTO {
  groupId: number
  reportId: number
}

export interface UpdateGroupReportDTO {
  groupId?: number
  reportId?: number
}

export async function createGroupReport(data: CreateGroupReportDTO, tenantId: number) {
  const group = await prisma.group.findFirst({
    where: {
      id: data.groupId,
      tenantId,
      isActive: true,
    },
    select: { id: true },
  })

  if (!group) {
    throw new Error('Grupo não encontrado no tenant')
  }

  const report = await prisma.report.findFirst({
    where: {
      id: data.reportId,
      tenantId,
      isActive: true,
    },
    select: { id: true },
  })

  if (!report) {
    throw new Error('Relatório não encontrado no tenant')
  }

  return prisma.groupReport.create({
    data,
    select: {
      groupId: true,
      reportId: true,
    },
  })
}

export async function listGroupReports(tenantId: number) {
  return prisma.groupReport.findMany({
    where: {
      group: { tenantId },
      report: { tenantId },
    },
    select: {
      groupId: true,
      reportId: true,
    },
  })
}

export async function listGroupReportsForUser(tenantId: number, userId: number) {
  return prisma.groupReport.findMany({
    where: {
      group: {
        tenantId,
        users: {
          some: {
            userId,
          },
        },
      },
      report: { tenantId },
    },
    select: {
      groupId: true,
      reportId: true,
    },
  })
}

export async function listGroupReportsAll() {
  return prisma.groupReport.findMany({
    select: {
      groupId: true,
      reportId: true,
    },
  })
}

export async function getGroupReport(groupId: number, reportId: number, tenantId: number) {
  return prisma.groupReport.findFirst({
    where: {
      groupId,
      reportId,
      group: { tenantId },
      report: { tenantId },
    },
  })
}

export async function getGroupReportForUser(groupId: number, reportId: number, tenantId: number, userId: number) {
  return prisma.groupReport.findFirst({
    where: {
      groupId,
      reportId,
      group: {
        tenantId,
        users: {
          some: {
            userId,
          },
        },
      },
      report: { tenantId },
    },
  })
}

export async function deleteGroupReport(groupId: number, reportId: number, tenantId: number) {
  const existing = await prisma.groupReport.findFirst({
    where: {
      groupId,
      reportId,
      group: { tenantId },
      report: { tenantId },
    },
    select: { groupId: true, reportId: true },
  })

  if (!existing) return null

  return prisma.groupReport.delete({
    where: {
      groupId_reportId: {
        groupId,
        reportId,
      },
    },
  })
}

