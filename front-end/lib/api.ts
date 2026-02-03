export const API_BASE_URL = "http://localhost:3001/api"

/* =====================
 * Errors
 * ===================== */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export class AuthError extends ApiError {
  constructor(message: string = "Sessão expirada") {
    super(message, 401, "AUTH_ERROR")
    this.name = "AuthError"
  }
}

/* =====================
 * Helpers
 * ===================== */

export function clearAuthAndRedirect(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/"
  }
}

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

/* =====================
 * Fetch wrapper (cookie-based)
 * ===================== */

export async function authFetch<T = any>(
  path: string,
  options: RequestInit & { skipAuthRedirect?: boolean } = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  try {
    const { skipAuthRedirect, ...fetchOptions } = options
    const url =
      path.startsWith("http://") || path.startsWith("https://")
        ? path
        : apiUrl(path)
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include", // ESSENCIAL PARA COOKIE AUTH
    })

    /* =====================
     * Auth errors
     * ===================== */

    if (response.status === 401) {
      if (!skipAuthRedirect) {
        clearAuthAndRedirect()
      }
      throw new AuthError("Sessão expirada")
    }

    if (response.status === 403) {
      const error = await response
        .json()
        .catch(() => ({ message: "Acesso negado" }))
      throw new ApiError(error.message || "Acesso negado", 403, "FORBIDDEN")
    }

    if (response.status === 404) {
      const error = await response
        .json()
        .catch(() => ({ message: "Recurso não encontrado" }))
      console.warn("Recurso não encontrado (404):", path, error.message)
      return [] as T
    }

    /* =====================
     * Other errors
     * ===================== */

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Erro na requisição" }))
      throw new ApiError(
        error.message || `Erro na requisição: ${response.status}`,
        response.status
      )
    }

    /* =====================
     * No content
     * ===================== */

    if (response.status === 204) {
      return null as T
    }

    return response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError("Erro de conexão com o servidor", 0, "NETWORK_ERROR")
    }

    throw new ApiError(
      error instanceof Error ? error.message : "Erro desconhecido",
      0,
      "UNKNOWN_ERROR"
    )
  }
}

