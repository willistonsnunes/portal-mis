import { prisma } from '../database/db.js'
import bcrypt from 'bcryptjs'
import { UserRole, UserType } from '../database/generated/prisma/client.js'

export interface CreateUserDTO {
  name: string
  email: string
  username: string
  password: string
  role: UserRole
  type: UserType
  tenantId: number
}

export interface UpdateUserDTO {
  name?: string
  email?: string
  username?: string
  password?: string
  role?: UserRole
  type?: UserType
  isActive?: boolean
}

export async function createUser(data: CreateUserDTO) {
  const passwordHash = await bcrypt.hash(data.password, 10)

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      username: data.username,
      password: passwordHash,
      role: data.role,
      type: data.type,
      tenantId: data.tenantId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      type: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
    },
  })
}

export async function getUserById(
  userId: number,
  tenantId: number
) {
  return prisma.user.findFirst({
    where: {
      id: userId,
      tenantId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      type: true,
      tenantId: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function getUserByIdAny(userId: number) {
  return prisma.user.findFirst({
    where: {
      id: userId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      type: true,
      tenantId: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function listUsersByTenant(tenantId: number) {
  return prisma.user.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      type: true,
      tenantId: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export async function listUsersAll() {
  return prisma.user.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      type: true,
      tenantId: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export async function updateUser(
  userId: number,
  tenantId: number,
  data: UpdateUserDTO
) {
  const updateData: any = { ...data }

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10)
  }

  const result = await prisma.user.updateMany({
    where: {
      id: userId,
      tenantId,
    },
    data: updateData,
  })

  if (!result.count) {
    return null
  }

  return prisma.user.findFirst({
    where: {
      id: userId,
      tenantId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      type: true,
      tenantId: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function deactivateUser(
  userId: number,
  tenantId: number
) {
  return prisma.user.updateMany({
    where: {
      id: userId,
      tenantId,
    },
    data: {
      isActive: false,
    },
  })
}

export async function resetUserPassword(
  userId: number,
  newPassword: string
) {
  const passwordHash = await bcrypt.hash(newPassword, 10)

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      type: true,
      tenantId: true,
      isActive: true,
      updatedAt: true,
    },
  })
}
