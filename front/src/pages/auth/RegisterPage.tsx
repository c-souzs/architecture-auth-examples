import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { resolveRedirect } from '@/router/routeConfig'

export function RegisterPage() {
  const { register, isAuthenticated, initializing, user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (initializing) return null
  if (isAuthenticated && user) return <Navigate to={resolveRedirect('/products', user)} replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Senha deve ter no mínimo 8 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/products', { replace: true })
    } catch {
      setError('Erro ao criar conta. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Criar conta</h1>
          <p className="text-sm text-gray-500 mt-1">Preencha seus dados para se cadastrar</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center">{error}</p>
          )}
          <Input
            id="name"
            label="Nome"
            type="text"
            placeholder="Seu nome completo"
            autoComplete="name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
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
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Input
            id="confirmPassword"
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
