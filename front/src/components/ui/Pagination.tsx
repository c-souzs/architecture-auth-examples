interface PaginationProps {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, totalElements, size, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const from = page * size + 1
  const to = Math.min((page + 1) * size, totalElements)

  const pages = buildPageRange(page, totalPages)

  return (
    <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
      <span>{from}–{to} de {totalElements}</span>
      <div className="flex items-center gap-1">
        <PageButton label="«" disabled={page === 0} onClick={() => onPageChange(0)} />
        <PageButton label="‹" disabled={page === 0} onClick={() => onPageChange(page - 1)} />
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 py-1 text-gray-400">…</span>
          ) : (
            <PageButton
              key={p}
              label={String(Number(p) + 1)}
              active={p === page}
              onClick={() => onPageChange(Number(p))}
            />
          )
        )}
        <PageButton label="›" disabled={page === totalPages - 1} onClick={() => onPageChange(page + 1)} />
        <PageButton label="»" disabled={page === totalPages - 1} onClick={() => onPageChange(totalPages - 1)} />
      </div>
    </div>
  )
}

function PageButton({ label, onClick, disabled, active }: { label: string; onClick?: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2.5 py-1 rounded-md text-sm transition-colors
        ${active ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-gray-700'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {label}
    </button>
  )
}

function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)

  const pages: (number | '...')[] = []

  pages.push(0)
  if (current > 2) pages.push('...')

  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) {
    pages.push(i)
  }

  if (current < total - 3) pages.push('...')
  pages.push(total - 1)

  return pages
}
