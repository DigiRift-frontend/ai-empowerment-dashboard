'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatNumber } from '@/lib/utils'

interface PointsDonutProps {
  entwicklung: number
  wartung: number
  schulung: number
  total: number
}

export function PointsDonut({ entwicklung, wartung, schulung, total }: PointsDonutProps) {
  const data = [
    { name: 'Entwicklung', value: entwicklung, color: '#3b82f6' },
    { name: 'Wartung', value: wartung, color: '#22c55e' },
    { name: 'Schulung', value: schulung, color: '#f59e0b' },
  ]

  const remaining = total - (entwicklung + wartung + schulung)
  if (remaining > 0) {
    data.push({ name: 'Verfügbar', value: remaining, color: '#e5e7eb' })
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">{formatNumber(payload[0].value)} Punkte</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
