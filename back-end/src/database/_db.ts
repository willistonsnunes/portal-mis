import { env } from '../config/env.js'
import sql, { config as SQLConfig } from 'mssql'

const dbConfig: SQLConfig = {
  server: env.DB_HOST_DW,
  port: env.DB_PORT_DW,
  database: env.DB_NAME_DW,
  user: env.DB_USER_DW,
  password: env.DB_PASSWORD_DW,
  options: {
    encrypt: false,              
    trustServerCertificate: true 
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
}

const dbConnect = new sql.ConnectionPool(dbConfig).connect()

export default dbConnect