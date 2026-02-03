import { z } from 'zod'
import { UserRole, UserType } from '../database/generated/prisma/client.js'

export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/, "A senha deve conter letra maiúscula, minúscula, número e símbolo")

export const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  username: z.string().min(3),
  password: passwordSchema,
  role: z.nativeEnum(UserRole),
  type: z.nativeEnum(UserType),
  tenantId: z.number(),
})

export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  password: passwordSchema.optional(),
  role: z.nativeEnum(UserRole).optional(),
  type: z.nativeEnum(UserType).optional(),
  isActive: z.boolean().optional(),
})

export const resetPasswordSchema = z.object({
  password: passwordSchema
})
