import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Link } from 'react-router-dom'

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Entrar</h1>
          <p className="text-sm text-gray-500 mt-1">Acesse sua conta</p>
        </div>

        <form className="flex flex-col gap-4">
          <Input
            id="email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
          />
          <Input
            id="password"
            label="Senha"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth>
            Entrar
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
