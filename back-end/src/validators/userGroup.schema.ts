import { z } from 'zod'

export const createUserGroupSchema = z.object({
  userId: z.number().int(),
  groupId: z.number().int(),
})

export const updateUserGroupSchema = z.object({
  userId: z.number().int().optional(),
  groupId: z.number().int().optional(),
})
