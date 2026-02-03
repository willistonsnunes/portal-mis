import { prisma } from '../database/db.js'

export interface CreateGroupDTO {
  name: string
  description?: string | null
  workspaceId?: string | null
  clientRef?: number | null
  tenantId: number
}

export interface UpdateGroupDTO {
  name?: string 
  description?: string | null
  workspaceId?: string | null
  clientRef?: number | null
  isActive?: boolean
}

export async function createGroup(data: CreateGroupDTO) {
  return prisma.group.create({
    data: {
      ...data
    },
    select: {
      id: true,
      name: true,
      description: true,
      workspaceId: true,
      clientRef: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function getGroupById(groupId: number, tenantId: number) {
  return prisma.group.findFirst({
    where: { id: groupId, tenantId, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      workspaceId: true,
      clientRef: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function getGroupByIdForUser(groupId: number, tenantId: number, userId: number) {
  return prisma.group.findFirst({
    where: {
      id: groupId,
      tenantId,
      isActive: true,
      users: {
        some: {
          userId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      workspaceId: true,
      clientRef: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function listGroupsByTenant(tenantId: number) {
  return prisma.group.findMany({
    where: { tenantId, isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      workspaceId: true,
      clientRef: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function listGroupsForUser(tenantId: number, userId: number) {
  return prisma.group.findMany({
    where: {
      tenantId,
      isActive: true,
      users: {
        some: {
          userId,
        },
      },
    },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      workspaceId: true,
      clientRef: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function getGroupByIdAny(groupId: number) {
  return prisma.group.findFirst({
    where: { id: groupId, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      workspaceId: true,
      clientRef: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function listGroupsAll() {
  return prisma.group.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      workspaceId: true,
      clientRef: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function updateGroup(groupId: number, tenantId: number, data: UpdateGroupDTO) {
  const updateData: any = { ...data }
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] === undefined) delete updateData[key]
  })

  return prisma.group.updateMany({
    where: { id: groupId, tenantId },
    data: updateData,
  })
}

export async function deactivateGroup(groupId: number, tenantId: number) {
  return prisma.group.updateMany({
    where: { id: groupId, tenantId },
    data: { isActive: false },
  })
}
