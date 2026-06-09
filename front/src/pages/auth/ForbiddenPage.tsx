import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function ForbiddenPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center flex flex-col gap-4">
        <h1 className="text-6xl font-bold text-gray-300">403</h1>
        <p className="text-xl font-semibold text-gray-700">Acesso negado</p>
        <p className="text-sm text-gray-500">Você não tem permissão para acessar esta página.</p>
        <Button onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    </div>
  )
}
