import { prisma } from '../database/db.js'

export interface CreateUserGroupDTO {
  userId: number
  groupId: number
}

export interface UpdateUserGroupDTO {
  userId?: number
  groupId?: number
}

export async function createUserGroup(data: CreateUserGroupDTO, tenantId: number) {
  const user = await prisma.user.findFirst({
    where: {
      id: data.userId,
      tenantId,
      isActive: true,
    },
    select: { id: true },
  })

  if (!user) {
    throw new Error('Usuário não encontrado no tenant')
  }

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

  return prisma.userGroup.create({
    data,
    select: {
      userId: true,
      groupId: true,
    },
  })
}

export async function listUserGroups(tenantId: number) {
  return prisma.userGroup.findMany({
    where: {
      user: { tenantId },
      group: { tenantId },
    },
    select: {
      userId: true,
      groupId: true,
    },
  })
}

export async function listUserGroupsForUser(tenantId: number, userId: number) {
  return prisma.userGroup.findMany({
    where: {
      userId,
      user: { tenantId },
      group: { tenantId },
    },
    select: {
      userId: true,
      groupId: true,
    },
  })
}

export async function listUserGroupsAll() {
  return prisma.userGroup.findMany({
    select: {
      userId: true,
      groupId: true,
    },
  })
}

export async function getUserGroup(userId: number, groupId: number, tenantId: number) {
  return prisma.userGroup.findFirst({
    where: {
      userId,
      groupId,
      user: { tenantId },
      group: { tenantId },
    },
  })
}

export async function deleteUserGroup(userId: number, groupId: number, tenantId: number) {
  const existing = await prisma.userGroup.findFirst({
    where: {
      userId,
      groupId,
      user: { tenantId },
      group: { tenantId },
    },
    select: { userId: true, groupId: true },
  })

  if (!existing) return null

  return prisma.userGroup.delete({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  })
}

