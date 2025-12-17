import { PointTransaction } from '@/types'
import { formatDate } from '@/lib/utils'
import { Code, Wrench, GraduationCap } from 'lucide-react'

interface TransactionListProps {
  transactions: PointTransaction[]
  limit?: number
}

export function TransactionList({ transactions, limit }: TransactionListProps) {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions

  const categoryConfig = {
    entwicklung: { icon: Code, color: 'bg-blue-100 text-blue-600', label: 'Entwicklung' },
    wartung: { icon: Wrench, color: 'bg-green-100 text-green-600', label: 'Wartung' },
    schulung: { icon: GraduationCap, color: 'bg-yellow-100 text-yellow-600', label: 'Schulung' },
  }

  return (
    <div className="space-y-3">
      {displayTransactions.map((transaction) => {
        const config = categoryConfig[transaction.category]
        const Icon = config.icon

        return (
          <div
            key={transaction.id}
            className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">-{transaction.points} Punkte</p>
              <p className="text-xs text-gray-500">{config.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
