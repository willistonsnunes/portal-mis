import { z } from 'zod'
import { PowerBIEmbeddedMode } from '../database/generated/prisma/client.js'

export const createTenantSchema = z.object({
  name: z.string().min(5, 'Nome � obrigat�rio'),
  code: z.string().min(5, 'C�digo � obrigat�rio'),
  socialId: z.string(),
  azureAdClientId: z.string().nullable().optional(),
  azureAdClientSecret: z.string().nullable().optional(),
  azureAdTenantId: z.string().nullable().optional(),
  pbiEmbeddedMode: z.nativeEnum(PowerBIEmbeddedMode).nullable().optional(),
  pbiClientId: z.string().nullable().optional(),
  pbiClientSecret: z.string().nullable().optional(),
  pbiTenantId: z.string().nullable().optional(),
  pbiUser: z.string().nullable().optional(),
  pbiPassword: z.string().nullable().optional(),
  pbiSecretValue: z.string().nullable().optional(),
})

export const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  socialId: z.string().optional(),
  azureAdClientId: z.string().nullable().optional(),
  azureAdClientSecret: z.string().nullable().optional(),
  azureAdTenantId: z.string().nullable().optional(),
  pbiEmbeddedMode: z.nativeEnum(PowerBIEmbeddedMode).nullable().optional(),
  pbiClientId: z.string().nullable().optional(),
  pbiClientSecret: z.string().nullable().optional(),
  pbiTenantId: z.string().nullable().optional(),
  pbiUser: z.string().nullable().optional(),
  pbiPassword: z.string().nullable().optional(),
  pbiSecretValue: z.string().nullable().optional(),
  isActive: z.boolean().nullable().optional(),
})

