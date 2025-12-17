import { ExternalCost } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Coins, Server, Phone, MoreHorizontal } from 'lucide-react'

interface ExternalCostsTableProps {
  costs: ExternalCost[]
}

export function ExternalCostsTable({ costs }: ExternalCostsTableProps) {
  const typeConfig = {
    tokens: { icon: Coins, label: 'API Tokens', color: 'text-purple-600 bg-purple-100' },
    server: { icon: Server, label: 'Server', color: 'text-blue-600 bg-blue-100' },
    telefonie: { icon: Phone, label: 'Telefonie', color: 'text-green-600 bg-green-100' },
    sonstige: { icon: MoreHorizontal, label: 'Sonstige', color: 'text-gray-600 bg-gray-100' },
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Typ
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Beschreibung
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Datum
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Betrag
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {costs.map((cost) => {
            const config = typeConfig[cost.type]
            const Icon = config.icon

            return (
              <tr key={cost.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`rounded p-1.5 ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{config.label}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{cost.description}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                  {formatDate(cost.date)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(cost.amount)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
