import { useNavigate } from 'react-router-dom'

export function ForbiddenPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <p className="text-6xl font-bold text-gray-300">403</p>
      <p className="text-xl font-semibold text-gray-700">Acesso negado</p>
      <p className="text-sm text-gray-500">Você não tem permissão para acessar esta página.</p>
      <button
        onClick={() => navigate(-1)}
        className="mt-2 px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
      >
        Voltar
      </button>
    </div>
  )
}
