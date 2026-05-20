import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export function Select({ label, error, id, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
