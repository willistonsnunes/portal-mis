import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/, "A senha deve conter letra maiúscula, minúscula, número e símbolo")

export const loginSchema = z.object({
  login: z.string().min(1, 'Login é obrigatório com usuário ou e-mail'),
  password: passwordSchema
})
