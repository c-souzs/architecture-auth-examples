import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Link } from 'react-router-dom'

export function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Criar conta</h1>
          <p className="text-sm text-gray-500 mt-1">Preencha seus dados para se cadastrar</p>
        </div>

        <form className="flex flex-col gap-4">
          <Input
            id="name"
            label="Nome"
            type="text"
            placeholder="Seu nome completo"
            autoComplete="name"
          />
          <Input
            id="email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
          />
          <Input
            id="cpf"
            label="CPF"
            type="text"
            placeholder="00000000000"
            maxLength={11}
          />
          <Input
            id="password"
            label="Senha"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <Input
            id="confirmPassword"
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <Button type="submit" fullWidth>
            Criar conta
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
