import { Request, Response, NextFunction } from 'express'

export function requireSelf(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autenticado' })
  }

  const userId = Number(req.params.id)

  if (!userId) {
    return res.status(400).json({ message: 'ID do usuário inválido' })
  }

  if (req.user.id !== userId) {
    return res.status(403).json({
      message: 'Você só pode executar ações no seu próprio usuário',
    })
  }

  next()
}


