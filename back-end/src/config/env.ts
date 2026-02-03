import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.string().transform((val) => parseInt(val, 10)).default(3000),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  DATABASE_URL: z.string(),

  CRYPTO_SECRET: z.string().min(32, 'CRYPTO_SECRET must be at least 32 characters long'),

  FRONTEND_URL: z.string().default('http://localhost:3000'),

  AZURE_AD_REDIRECT_URI: z.string(),
  AZURE_AD_SCOPES: z.string().default('openid profile email'),

  DB_HOST_DW: z.string(),
  DB_PORT_DW: z.string().transform((val) => parseInt(val, 10)).default(1433),
  DB_NAME_DW: z.string(),
  DB_USER_DW: z.string(),
  DB_PASSWORD_DW: z.string(),

  POWERBI_API_URL: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('Invalid environment variables', _env.error.format())
  throw new Error('Invalid environment variables')
}

export const env = _env.data
