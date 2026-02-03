import { z } from 'zod'

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Nome � obrigat�rio'),
  description: z.string().nullable().optional(),
  workspaceId: z.string().nullable().optional(),
  clientRef: z.number().nullable().optional(),
  tenantId: z.number(),
})

export const updateGroupSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  workspaceId: z.string().nullable().optional(),
  clientRef: z.number().optional(),
  isActive: z.boolean().optional(),
})
