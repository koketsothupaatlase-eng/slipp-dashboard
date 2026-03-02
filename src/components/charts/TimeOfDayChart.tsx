'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

interface HourlyData {
  hour:              number
  transaction_count: number
  total_revenue:     number
}

function formatHour(h: number) {
  if (h === 0)  return '12am'
  if (h < 12)  return `${h}am`
  if (h === 12) return '12pm'
  return `${h - 12}pm`
}

export function TimeOfDayChart({ data }: { data: HourlyData[] }) {
  // Fill in missing hours with 0
  const filled = Array.from({ length: 24 }, (_, h) => {
    const d = data.find((x) => x.hour === h)
    return { label: formatHour(h), count: d?.transaction_count ?? 0 }
  })

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={filled} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 9 }}
          tickLine={false}
          axisLine={false}
          interval={2}
        />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          formatter={(v: number) => [v, 'Transactions']}
          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Bar dataKey="count" fill="#3D7A3D" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
