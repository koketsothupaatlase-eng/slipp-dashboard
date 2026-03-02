interface StatCardProps {
  label:      string
  value:      string | number
  sub?:       string
  icon?:      React.ReactNode
  trend?:     'up' | 'down' | 'neutral'
  trendLabel?: string
}

export function StatCard({ label, value, sub, icon, trend, trendLabel }: StatCardProps) {
  const trendColor =
    trend === 'up'   ? 'text-green-600' :
    trend === 'down' ? 'text-red-500'   : 'text-gray-400'

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-gray-300">{icon}</span>}
      </div>
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      {(sub || trendLabel) && (
        <div className="flex items-center gap-1">
          {trendLabel && <span className={`text-xs font-medium ${trendColor}`}>{trendLabel}</span>}
          {sub && <span className="text-xs text-gray-400">{sub}</span>}
        </div>
      )}
    </div>
  )
}
