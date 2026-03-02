'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CategoryData {
  category: string
  total:    number
}

const COLORS = ['#3D7A3D', '#C8E63C', '#60a5fa', '#f97316', '#a78bfa', '#fb7185', '#34d399']

export function CategoryPieChart({ data }: { data: CategoryData[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">No data yet</div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          cx="50%"
          cy="45%"
          outerRadius={90}
          innerRadius={50}
          paddingAngle={3}
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => [`R ${v.toFixed(2)}`, 'Revenue']} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
