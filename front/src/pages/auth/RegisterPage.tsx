import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import type { ErrorResponse } from '@/models/error'

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/users', { replace: true })
  }, [isAuthenticated, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (password.length < 8) {
      setError('Senha deve ter no mínimo 8 caracteres')
      return
    }

    setLoading(true)
    try {
      await register({ name, email, password })
      navigate('/users', { replace: true })
    } catch (err) {
      setError(extractMessage(err))
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
          <Input
            id="name"
            label="Nome"
            type="text"
            placeholder="Seu nome completo"
            autoComplete="name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <Input
            id="email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Senha"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Input
            id="confirmPassword"
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar conta'}
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

function extractMessage(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data) {
    return (err.response.data as ErrorResponse).message ?? 'Erro desconhecido'
  }
  return 'Erro de conexão. Tente novamente.'
}
