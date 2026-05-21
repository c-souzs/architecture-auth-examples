import type { ReactNode } from 'react'

export interface Column<T> {
  header: string
  render: (row: T) => ReactNode
  width?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  keyExtractor: (row: T) => string | number
}

export function Table<T>({ columns, data, loading, emptyMessage = 'Nenhum registro encontrado.', keyExtractor }: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
          <tr>
            {columns.map(col => (
              <th key={col.header} className="px-4 py-3 text-left font-medium" style={{ width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                Carregando...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map(row => (
              <tr key={keyExtractor(row)} className="hover:bg-gray-50 transition-colors">
                {columns.map(col => (
                  <td key={col.header} className="px-4 py-3 text-gray-800">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
