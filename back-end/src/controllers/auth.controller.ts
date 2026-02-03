import { Request, Response } from 'express'
import { ZodError } from 'zod'
import * as AuthService from '../services/auth.service.js'
import { loginSchema } from '../validators/auth.schema.js'

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  })
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 4 * 60 * 60 * 1000,
  })
}

export async function login(req: Request, res: Response) {
  try {
    const data = loginSchema.parse(req.body)
    const result = await AuthService.login(data)

    switch (result.status) {
      case 'not_found':
        return res.status(404).json({ message: 'Usuário não encontrado' })
      case 'invalid':
        return res.status(401).json({ message: 'Login ou senha inválidos' })
      case 'inactive':
        return res.status(401).json({ message: 'Usuário inativo' })
      case 'ok':
        setAuthCookies(res, result.accessToken, result.refreshToken)
        return res.json(result.user)
    }
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.issues })
    }
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const token = req.cookies?.refreshToken
    if (!token) return res.status(401).json({ message: 'Não autorizado' })

    const result = await AuthService.refreshToken(token)
    if (!result) return res.status(401).json({ message: 'Token inválido ou expirado' })

    setAuthCookies(res, result.accessToken, result.refreshToken)

    return res.json(result.user)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function logout(req: Request, res: Response) {
  try {
    AuthService.logout()
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function me(req: Request, res: Response) {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ message: 'Não autenticado' })
    }

    return res.json(user)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
