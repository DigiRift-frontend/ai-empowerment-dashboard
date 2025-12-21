'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CustomerSchulungAssignment, Schulung, SchulungAssignmentStatus } from '@/types'
import {
  Calendar,
  GraduationCap,
  Users,
  Clock,
  Star,
  MessageSquare,
  Video,
  FileText,
  Play,
  BookOpen,
} from 'lucide-react'

interface SchulungKanbanBoardProps {
  assignments: CustomerSchulungAssignment[]
  onStatusChange: (assignmentId: string, newStatus: SchulungAssignmentStatus) => void
  onAssignmentClick?: (assignment: CustomerSchulungAssignment) => void
}

const statusConfig: Record<SchulungAssignmentStatus, { label: string; color: string; columnColor: string }> = {
  geplant: { label: 'Geplant', color: 'bg-gray-100 text-gray-700', columnColor: 'border-gray-300' },
  in_vorbereitung: { label: 'In Vorbereitung', color: 'bg-yellow-100 text-yellow-700', columnColor: 'border-yellow-400' },
  durchgefuehrt: { label: 'Durchgeführt', color: 'bg-blue-100 text-blue-700', columnColor: 'border-blue-400' },
  abgeschlossen: { label: 'Abgeschlossen', color: 'bg-green-100 text-green-700', columnColor: 'border-green-400' },
}

const statuses: SchulungAssignmentStatus[] = ['geplant', 'in_vorbereitung', 'durchgefuehrt', 'abgeschlossen']

const formatLabels: Record<string, { label: string; icon: typeof Video }> = {
  live: { label: 'Live', icon: Users },
  self_learning: { label: 'Self-Learning', icon: BookOpen },
  hybrid: { label: 'Hybrid', icon: Play },
}

interface SchulungKanbanCardProps {
  assignment: CustomerSchulungAssignment
  onAssignmentClick?: (assignment: CustomerSchulungAssignment) => void
}

function SchulungKanbanCard({ assignment, onAssignmentClick }: SchulungKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: assignment.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const schulung = assignment.schulung
  const format = schulung?.format || 'live'
  const FormatIcon = formatLabels[format]?.icon || Users

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onAssignmentClick?.(assignment)}
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex-shrink-0">
          <GraduationCap className="h-5 w-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm truncate">
            {schulung?.title || 'Schulung'}
          </h4>
          {schulung && (
            <span className={`inline-flex items-center gap-1 text-xs mt-1 ${
              schulung.category === 'grundlagen' ? 'text-emerald-600' :
              schulung.category === 'fortgeschritten' ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {schulung.category}
            </span>
          )}
        </div>
      </div>

      {/* Format Badge */}
      {schulung && (
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
            format === 'live' ? 'bg-blue-100 text-blue-700' :
            format === 'self_learning' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
          }`}>
            <FormatIcon className="h-3 w-3" />
            {formatLabels[format]?.label || format}
          </span>
        </div>
      )}

      {/* Schedule Date */}
      {assignment.scheduledDate && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {new Date(assignment.scheduledDate).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      )}

      {/* Duration & Points */}
      {schulung && (
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {schulung.duration}
          </span>
          <span className="flex items-center gap-1 text-primary-600 font-medium">
            {schulung.points} Punkte
          </span>
        </div>
      )}

      {/* Participants */}
      {assignment.participantCount && assignment.participantCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <Users className="h-3.5 w-3.5" />
          <span>{assignment.participantCount} Teilnehmer</span>
        </div>
      )}

      {/* Materials Indicator */}
      {schulung?.materials && schulung.materials.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <FileText className="h-3.5 w-3.5" />
          <span>{schulung.materials.length} Materialien</span>
        </div>
      )}

      {/* Rating (for completed) */}
      {assignment.rating && (
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-3.5 w-3.5 ${
                star <= assignment.rating!
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          {assignment.feedback && (
            <MessageSquare className="h-3.5 w-3.5 text-gray-400 ml-2" />
          )}
        </div>
      )}

      {/* Customer Info */}
      {assignment.customerId && (
        <div className="pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Kunde #{assignment.customerId.slice(0, 8)}
          </span>
        </div>
      )}
    </div>
  )
}

function SchulungKanbanColumn({
  status,
  assignments,
  onAssignmentClick,
}: {
  status: SchulungAssignmentStatus
  assignments: CustomerSchulungAssignment[]
  onAssignmentClick?: (assignment: CustomerSchulungAssignment) => void
}) {
  const config = statusConfig[status]
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  return (
    <div className="flex flex-col">
      <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${config.columnColor}`}>
        <span className="font-medium text-gray-700">{config.label}</span>
        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">
          {assignments.length}
        </span>
      </div>
      <SortableContext items={assignments.map(a => a.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 space-y-3 min-h-[200px] rounded-lg p-2 -m-2 transition-colors ${
            isOver ? 'bg-primary-50 ring-2 ring-primary-200' : ''
          }`}
          data-status={status}
        >
          {assignments.map((assignment) => (
            <SchulungKanbanCard
              key={assignment.id}
              assignment={assignment}
              onAssignmentClick={onAssignmentClick}
            />
          ))}
          {assignments.length === 0 && (
            <div className={`flex items-center justify-center h-24 border-2 border-dashed rounded-lg text-sm transition-colors ${
              isOver ? 'border-primary-300 text-primary-500 bg-primary-50' : 'border-gray-200 text-gray-400'
            }`}>
              {isOver ? 'Hier ablegen' : 'Keine Schulungen'}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export function SchulungKanbanBoard({ assignments, onStatusChange, onAssignmentClick }: SchulungKanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [localAssignments, setLocalAssignments] = useState(assignments)

  // Sync localAssignments when assignments prop changes
  useEffect(() => {
    setLocalAssignments(assignments)
  }, [assignments])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const activeAssignment = activeId ? localAssignments.find(a => a.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeAssignment = localAssignments.find(a => a.id === active.id)
    if (!activeAssignment) return

    // Find the target column
    let targetStatus: SchulungAssignmentStatus | null = null

    // Check if dropped over another item
    const overAssignment = localAssignments.find(a => a.id === over.id)
    if (overAssignment) {
      targetStatus = overAssignment.status
    } else {
      // Check if dropped in an empty column by looking at the droppable id
      const overId = over.id as string
      if (statuses.includes(overId as SchulungAssignmentStatus)) {
        targetStatus = overId as SchulungAssignmentStatus
      }
    }

    if (targetStatus && targetStatus !== activeAssignment.status) {
      // Update local state
      setLocalAssignments(prev =>
        prev.map(assignment =>
          assignment.id === active.id ? { ...assignment, status: targetStatus! } : assignment
        )
      )
      // Notify parent
      onStatusChange(active.id as string, targetStatus)
    }
  }

  // Group assignments by status
  const columns = statuses.reduce((acc, status) => {
    acc[status] = localAssignments.filter(assignment => assignment.status === status)
    return acc
  }, {} as Record<SchulungAssignmentStatus, CustomerSchulungAssignment[]>)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-4 gap-4">
        {statuses.map((status) => (
          <SchulungKanbanColumn
            key={status}
            status={status}
            assignments={columns[status]}
            onAssignmentClick={onAssignmentClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeAssignment ? (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-lg opacity-90">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary-600" />
              <h4 className="font-medium text-gray-900 text-sm">
                {activeAssignment.schulung?.title || 'Schulung'}
              </h4>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
