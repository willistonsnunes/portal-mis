import { prisma } from '../database/db.js'
import { encrypt } from '../utils/crypto.js'
import { PowerBIEmbeddedMode } from '../database/generated/prisma/client.js'

export interface CreateTenantDTO {
  name: string
  code: string
  socialId: string
  isActive?: boolean
  azureAdClientId?: string | null
  azureAdClientSecret?: string | null
  azureAdTenantId?: string | null
  pbiEmbeddedMode?: PowerBIEmbeddedMode | null 
  pbiClientId?: string | null
  pbiClientSecret?: string | null
  pbiTenantId?: string | null
  pbiUser?: string | null
  pbiPassword?: string | null
  pbiSecretValue?: string | null
}

export interface UpdateTenantDTO {
  name?: string
  code?: string
  socialId?: string 
  isActive?: boolean 
  azureAdClientId?: string | null
  azureAdClientSecret?: string | null
  azureAdTenantId?: string | null
  pbiEmbeddedMode?: PowerBIEmbeddedMode | null 
  pbiClientId?: string | null
  pbiClientSecret?: string | null
  pbiTenantId?: string | null
  pbiUser?: string | null
  pbiPassword?: string | null
  pbiSecretValue?: string | null
}

export async function createTenant(data: CreateTenantDTO) {
  return prisma.tenant.create({
      data: {
        ...data,

        azureAdClientId: data.azureAdClientId
          ? encrypt(data.azureAdClientId)
          : null,

        azureAdClientSecret: data.azureAdClientSecret
          ? encrypt(data.azureAdClientSecret)
          : null,

        azureAdTenantId: data.azureAdTenantId
          ? encrypt(data.azureAdTenantId)
          : null,

        pbiClientId: data.pbiClientId
          ? encrypt(data.pbiClientId)
          : null,

        pbiClientSecret: data.pbiClientSecret
          ? encrypt(data.pbiClientSecret)
          : null,

        pbiTenantId: data.pbiTenantId
          ? encrypt(data.pbiTenantId)
          : null,

        pbiUser: data.pbiUser
          ? encrypt(data.pbiUser)
          : null,

        pbiPassword: data.pbiPassword
          ? encrypt(data.pbiPassword)
          : null,

        pbiSecretValue: data.pbiSecretValue
          ? encrypt(data.pbiSecretValue)
          : null,
      },
      select: {
        id: true,
        name: true,
        code: true,
        socialId: true,
        isActive: true,
        pbiEmbeddedMode: true,
        createdAt: true,
        updatedAt: true,
      },
    })
}

export async function getTenantById(id: number) {
  return prisma.tenant.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      code: true,
      socialId: true,
      isActive: true,
      pbiEmbeddedMode: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function listTenants() {
  return prisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      socialId: true,
      isActive: true,
      pbiEmbeddedMode: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { name: 'asc' },
  })
}

export async function updateTenant(id: number, data: UpdateTenantDTO) {
  const dataToUpdate: UpdateTenantDTO = {
    ...data,

    azureAdClientId: data.azureAdClientId
      ? encrypt(data.azureAdClientId)
      : undefined,

    azureAdClientSecret: data.azureAdClientSecret
      ? encrypt(data.azureAdClientSecret)
      : undefined,

    azureAdTenantId: data.azureAdTenantId
      ? encrypt(data.azureAdTenantId)
      : undefined,

    pbiClientId: data.pbiClientId
      ? encrypt(data.pbiClientId)
      : undefined,

    pbiClientSecret: data.pbiClientSecret
      ? encrypt(data.pbiClientSecret)
      : undefined,

    pbiTenantId: data.pbiTenantId
      ? encrypt(data.pbiTenantId)
      : undefined,

    pbiUser: data.pbiUser
      ? encrypt(data.pbiUser)
      : undefined,

    pbiPassword: data.pbiPassword
      ? encrypt(data.pbiPassword)
      : undefined,

    pbiSecretValue: data.pbiSecretValue
      ? encrypt(data.pbiSecretValue)
      : undefined,
  }

  return prisma.tenant.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      name: true,
      code: true,
      socialId: true,
      isActive: true,
      pbiEmbeddedMode: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function deactivateTenant(id: number) {
  return prisma.tenant.update({
    where: { id },
    data: { isActive: false },
    select: {
      id: true,
      name: true,
      code: true,
      isActive: true,
    },
  })
}
