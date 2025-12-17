'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { MonthlySummary } from '@/types'

interface MonthlyChartProps {
  data: MonthlySummary[]
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    month: new Date(item.month + '-01').toLocaleDateString('de-DE', { month: 'short' }),
  }))

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="mb-2 font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} Punkte
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
          />
          <Bar dataKey="entwicklung" name="Entwicklung" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="wartung" name="Wartung" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="schulung" name="Schulung" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
