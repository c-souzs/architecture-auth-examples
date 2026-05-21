type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple' | 'indigo'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-700',
  indigo: 'bg-indigo-100 text-indigo-700',
}

export function Badge({ label, variant = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}>
      {label}
    </span>
  )
}

export function statusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    ACTIVE: 'green',
    ENABLED: 'green',
    REGULAR: 'green',
    CONFIRMED: 'green',
    DELIVERED: 'green',
    INACTIVE: 'gray',
    DISCONTINUED: 'red',
    DISABLED: 'red',
    CANCELLED: 'red',
    FAILED: 'red',
    REFUNDED: 'purple',
    PENDING: 'yellow',
    PENDING_COUNT: 'yellow',
    PROCESSING: 'blue',
    SHIPPED: 'blue',
    PAYMENT_CONFIRMED: 'blue',
    DIVERGENT: 'red',
    LOW_STOCK: 'yellow',
    LOCKED: 'red',
  }
  return map[status] ?? 'gray'
}
