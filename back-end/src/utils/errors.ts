export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Requisição inválida') {
    super(message, 400, 'BAD_REQUEST')
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflito de dados') {
    super(message, 409, 'CONFLICT')
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = 'Erro de validação',
    public errors?: Record<string, string[]>
  ) {
    super(message, 422, 'VALIDATION_ERROR')
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super('Credenciais inválidas')
    this.code = 'INVALID_CREDENTIALS'
  }
}

export class TokenExpiredError extends UnauthorizedError {
  constructor() {
    super('Token expirado')
    this.code = 'TOKEN_EXPIRED'
  }
}

export class InvalidTokenError extends UnauthorizedError {
  constructor() {
    super('Token inválido')
    this.code = 'INVALID_TOKEN'
  }
}

export class InactiveUserError extends ForbiddenError {
  constructor() {
    super('Usuário inativo')
    this.code = 'INACTIVE_USER'
  }
}
