type UploadProgressProps = {
  value: number
  label?: string
  className?: string
}

export default function UploadProgress({
  value,
  label = 'Téléchargement en cours',
  className = '',
}: UploadProgressProps) {
  const percentage = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <div className={`space-y-1.5 ${className}`} role="status" aria-live="polite">
      <div className="flex items-center justify-between text-xs font-medium text-gray-600">
        <span>{label}</span>
        <span className="tabular-nums text-amber-700">{percentage}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-amber-100"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-700 transition-[width] duration-200 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
