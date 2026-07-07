import type { HostingResult } from '@/core/types'

const CONFIG = {
  green: { icon: '✅', label: 'Green hosted', className: 'text-ij-success' },
  unknown: {
    icon: '⚪',
    label: 'Hosting unknown',
    className: 'text-ij-text-tertiary',
  },
  'not-green': {
    icon: '❌',
    label: 'Not green hosted',
    className: 'text-ij-error',
  },
} as const

export function HostingBadge({ hosting }: { hosting: HostingResult }) {
  const { icon, label, className } = CONFIG[hosting.status]
  return (
    <div className="flex items-center gap-2 text-sm">
      <span aria-hidden>{icon}</span>
      <span className={`font-medium ${className}`}>{label}</span>
      {hosting.hostedBy && (
        <span
          className="truncate text-xs text-ij-text-tertiary"
          title={hosting.hostedBy}
        >
          · {hosting.hostedBy}
        </span>
      )}
    </div>
  )
}
