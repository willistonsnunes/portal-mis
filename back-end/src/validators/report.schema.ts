import { z } from 'zod'

export const createReportSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().nullable().optional(),
  workspaceId: z.string().nullable().optional(),
  reportId: z.string().nullable().optional(),
  embedUrl: z.string().nullable().optional(),
  reportKey: z.string().min(5, 'ReportKey é obrigatório'),
  tenantId: z.number(),
})

export const updateReportSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  workspaceId: z.string().nullable().optional(),
  reportId: z.string().nullable().optional(),
  embedUrl: z.string().nullable().optional(),
  reportKey: z.string().optional(),
  isActive: z.boolean().optional(),
})
