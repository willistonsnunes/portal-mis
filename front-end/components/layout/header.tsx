"use client"

import { Search, Moon, Sun, LogOut, KeyRound, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ApiError, authFetch } from "@/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function Header() {
  const [isDark, setIsDark] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetPassword, setResetPassword] = useState("")
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState("")
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)
  const { user, logout } = useAuth()


  useEffect(() => {
    if (!user) return

    const themeKey = `theme_${user.email || user.id}`
    const savedTheme = localStorage.getItem(themeKey)
    const isDarkMode = savedTheme === "dark"
    
    setIsDark(isDarkMode)
    
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [user])

  const toggleTheme = () => {
    if (!user) return

    const newTheme = !isDark
    setIsDark(newTheme)
    
    const themeKey = `theme_${user.email || user.id}`
    localStorage.setItem(themeKey, newTheme ? "dark" : "light")
    
    if (newTheme) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleResetPassword = async () => {
    if (!user) return

    if (!resetPassword || !resetPasswordConfirm) {
      setResetError("Informe e confirme a nova senha.")
      return
    }

    if (resetPassword !== resetPasswordConfirm) {
      setResetError("As senhas não conferem.")
      return
    }

    setResetError(null)
    setResetLoading(true)

    try {
      await authFetch(`/users/${user.id}/reset-password`, {
        method: "PATCH",
        body: JSON.stringify({ password: resetPassword }),
      })

      await logout()
    } catch (error) {
      if (error instanceof ApiError) {
        setResetError(error.message)
      } else if (error instanceof Error) {
        setResetError(error.message)
      } else {
        setResetError("Não foi possível redefinir a senha.")
      }
    } finally {
      setResetLoading(false)
    }
  }

  const handleOpenReset = () => {
    setResetPassword("")
    setResetPasswordConfirm("")
    setResetError(null)
    setResetOpen(true)
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar..." className="w-64 pl-9" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {(user.name?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase()}
                </div>
                <div className="hidden flex-col items-start md:flex">
                  <span className="text-sm font-medium">{user.name ?? "Usuário"}</span>
                  <span className="text-xs text-muted-foreground">{user.email ?? ""}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleOpenReset} className="cursor-pointer">
                <KeyRound className="mr-2 h-4 w-4" />
                Redefinir Senha
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Dialog
        open={resetOpen}
        onOpenChange={(open) => {
          setResetOpen(open)
          if (!open) {
            setResetPassword("")
            setResetPasswordConfirm("")
            setResetError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
            <DialogDescription>
              Após redefinir, você será desconectado para entrar novamente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="new-password">
                Nova senha
              </label>
              <Input
                id="new-password"
                type="password"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
                placeholder="Digite a nova senha"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="confirm-password">
                Confirmar senha
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={resetPasswordConfirm}
                onChange={(event) => setResetPasswordConfirm(event.target.value)}
                placeholder="Confirme a nova senha"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula,
              número e símbolo.
            </p>
            {resetError && (
              <p className="text-sm text-destructive">{resetError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetOpen(false)}
              disabled={resetLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleResetPassword} disabled={resetLoading}>
              {resetLoading ? "Salvando..." : "Redefinir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
