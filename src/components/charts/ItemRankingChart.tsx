'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

interface ItemData {
  item_name:     string
  total_quantity: number
  total_revenue:  number
}

export function ItemRankingChart({ data }: { data: ItemData[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">No data yet</div>
    )
  }

  const chartData = data
    .slice(0, 10)
    .map((d) => ({ name: d.item_name, qty: Number(d.total_quantity) }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip formatter={(v: number) => [v, 'Units sold']} />
        <Bar dataKey="qty" radius={[0, 4, 4, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={i === 0 ? '#3D7A3D' : i < 3 ? '#60a05a' : '#a3c4a3'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
