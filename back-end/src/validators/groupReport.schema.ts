import { z } from 'zod'

export const createGroupReportSchema = z.object({
  groupId: z.number().int(),
  reportId: z.number().int(),
})

export const updateGroupReportSchema = z.object({
  groupId: z.number().int().optional(),
  reportId: z.number().int().optional(),
})
