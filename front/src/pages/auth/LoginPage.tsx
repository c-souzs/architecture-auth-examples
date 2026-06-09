import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { resolveRedirect } from '@/router/routeConfig'

export function LoginPage() {
  const { login, isAuthenticated, initializing, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: string })?.from ?? '/products'

  if (initializing) return null
  if (isAuthenticated && user) return <Navigate to={resolveRedirect(from, user)} replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const loggedUser = await login(email, password)
      const from = (location.state as { from?: string })?.from ?? '/products'
      navigate(resolveRedirect(from, loggedUser), { replace: true })
    } catch {
      setError('E-mail ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Entrar</h1>
          <p className="text-sm text-gray-500 mt-1">Acesse sua conta</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center">{error}</p>
          )}
          <Input
            id="email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            id="password"
            label="Senha"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline font-medium">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
