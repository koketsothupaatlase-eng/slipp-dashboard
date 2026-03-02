'use client'

interface DowData {
  day_of_week:       number
  transaction_count: number
  total_revenue:     number
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function DayOfWeekHeatmap({ data }: { data: DowData[] }) {
  const max = Math.max(...data.map((d) => d.transaction_count), 1)

  const cells = DAYS.map((day, i) => {
    const d     = data.find((x) => x.day_of_week === i)
    const count = d?.transaction_count ?? 0
    const pct   = count / max
    // Color intensity from light green to dark green
    const bg    = count === 0
      ? 'bg-gray-100'
      : pct < 0.25  ? 'bg-green-100'
      : pct < 0.5   ? 'bg-green-200'
      : pct < 0.75  ? 'bg-green-400'
      : 'bg-brand-green'
    const text  = pct >= 0.5 ? 'text-white' : 'text-gray-700'

    return { day, count, bg, text, revenue: d?.total_revenue ?? 0 }
  })

  return (
    <div className="grid grid-cols-7 gap-2">
      {cells.map(({ day, count, bg, text, revenue }) => (
        <div
          key={day}
          className={`${bg} rounded-lg p-3 flex flex-col items-center gap-1 group relative cursor-default`}
        >
          <span className={`text-xs font-medium ${text}`}>{day}</span>
          <span className={`text-lg font-bold ${text}`}>{count}</span>
          {/* Tooltip on hover */}
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
            {count} txns · R{Number(revenue).toFixed(0)}
          </div>
        </div>
      ))}
    </div>
  )
}
