import { Meeting } from '@/types'
import { formatDate } from '@/lib/utils'
import { Calendar, Users, Video, FileCheck } from 'lucide-react'

interface UpcomingMeetingsProps {
  meetings: Meeting[]
}

export function UpcomingMeetings({ meetings }: UpcomingMeetingsProps) {
  const typeConfig = {
    abstimmung: { icon: Users, color: 'bg-blue-100 text-blue-600', label: 'Abstimmung' },
    workshop: { icon: Video, color: 'bg-yellow-100 text-yellow-600', label: 'Workshop' },
    review: { icon: FileCheck, color: 'bg-green-100 text-green-600', label: 'Review' },
  }

  const upcomingMeetings = meetings
    .filter((m) => new Date(m.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  if (upcomingMeetings.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <Calendar className="mr-2 h-5 w-5" />
        <span>Keine anstehenden Termine</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {upcomingMeetings.map((meeting) => {
        const config = typeConfig[meeting.type]
        const Icon = config.icon

        return (
          <div
            key={meeting.id}
            className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
          >
            <div className={`rounded-lg p-2 ${config.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{meeting.title}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(meeting.date)}</span>
                <span className="rounded-full bg-gray-200 px-2 py-0.5">{config.label}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
