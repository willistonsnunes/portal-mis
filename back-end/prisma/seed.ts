import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../src/database/generated/prisma/client.js"

const connectionString = process.env.DATABASE_URL || ""
const adapter = new PrismaBetterSqlite3({ url: connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Iniciando seed...")

  const tenant = await prisma.tenant.upsert({
    where: { code: "SYS_ADMIN" },
    update: {},
    create: {
      name: "System Admin",
      code: "SYS_ADMIN",
      socialId: "SOCIAL_001",
      pbiEmbeddedMode: "MASTER_USER"
    },
  })

  console.log("Tenant criado:", tenant.id, tenant.name)

  const passwordHash = await bcrypt.hash("Admin@123", 10)

  const superAdmin = await prisma.user.upsert({
    where: { username: "sa" },
    update: {},
    create: {
      name: "Super Admin",
      email: "sa@sysadmin.com",
      username: "sa",
      password: passwordHash,
      role: "SUPER_ADMIN", 
      type: "INTERNAL",
      tenantId: tenant.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      type: true,
      tenantId: true,
    },
  })

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@sysadmin.com",
      username: "admin",
      password: passwordHash,
      role: "ADMIN", 
      type: "INTERNAL",
      tenantId: tenant.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      type: true,
      tenantId: true,
    },
  })

  const user = await prisma.user.upsert({
    where: { username: "user" },
    update: {},
    create: {
      name: "User",
      email: "user@sysadmin.com",
      username: "user",
      password: passwordHash,
      role: "USER", 
      type: "INTERNAL",
      tenantId: tenant.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      type: true,
      tenantId: true,
    },
  })

  console.log("Super Admin criado:", superAdmin.username)
  console.log("Admin criado:", admin.username)
  console.log("User criado:", user.username)
  console.log("Seed finalizada!")
}

main()
  .catch((e) => {
    console.error("Erro na seed:", e)
  })
  .finally(() => prisma.$disconnect())

