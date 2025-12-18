'use client'

import { useState } from 'react'
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
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Module, TeamMember, ModuleStatus } from '@/types'
import { GripVertical, Calendar, Check, Clock, User, ListChecks, ExternalLink } from 'lucide-react'

interface KanbanBoardProps {
  items: Module[]
  teamMembers: TeamMember[]
  onStatusChange: (itemId: string, newStatus: ModuleStatus) => void
  onAssigneeChange: (itemId: string, assigneeId: string | null) => void
  onItemClick?: (item: Module) => void
  showMaintenancePoints?: boolean // For modules view
}

const statusConfig: Record<ModuleStatus, { label: string; color: string; columnColor: string }> = {
  geplant: { label: 'Geplant', color: 'bg-gray-100 text-gray-700', columnColor: 'border-gray-300' },
  'in-arbeit': { label: 'In Arbeit', color: 'bg-blue-100 text-blue-700', columnColor: 'border-blue-400' },
  'im-test': { label: 'Im Test', color: 'bg-yellow-100 text-yellow-700', columnColor: 'border-yellow-400' },
  abgeschlossen: { label: 'Fertig', color: 'bg-green-100 text-green-700', columnColor: 'border-green-400' },
}

const statuses: ModuleStatus[] = ['geplant', 'in-arbeit', 'im-test', 'abgeschlossen']

interface KanbanCardProps {
  item: Module
  teamMembers: TeamMember[]
  onAssigneeChange: (itemId: string, assigneeId: string | null) => void
  onItemClick?: (item: Module) => void
  showMaintenancePoints?: boolean
}

function KanbanCard({ item, teamMembers, onAssigneeChange, onItemClick, showMaintenancePoints }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const assignee = teamMembers.find(m => m.id === item.assigneeId)
  const criteriaCount = item.acceptanceCriteria?.length || 0
  const acceptedCount = item.acceptanceCriteria?.filter(c => c.accepted).length || 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onItemClick?.(item)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 -m-1 hover:bg-gray-100 rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
        {item.description}
      </p>

      {/* Maintenance Points (for modules view) */}
      {showMaintenancePoints && item.monthlyMaintenancePoints > 0 && (
        <div className="mb-3 text-xs text-gray-500">
          <span className="font-medium">{item.monthlyMaintenancePoints}</span> Punkte/Monat
        </div>
      )}

      {/* Software URL (for live modules) */}
      {item.softwareUrl && item.status === 'abgeschlossen' && (
        <div className="mb-3">
          <a
            href={item.softwareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
          >
            <ExternalLink className="h-3 w-3" />
            Software öffnen
          </a>
        </div>
      )}

      {/* Acceptance Criteria Badge */}
      {criteriaCount > 0 && (
        <div className="mb-3">
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
              acceptedCount === criteriaCount
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <ListChecks className="h-3 w-3" />
            Kriterien: {acceptedCount}/{criteriaCount}
          </span>
        </div>
      )}

      {/* Acceptance Status */}
      {item.acceptanceStatus && (
        <div className="mb-3">
          <span
            className={`inline-flex items-center gap-1 text-xs ${
              item.acceptanceStatus === 'akzeptiert'
                ? 'text-green-600'
                : 'text-yellow-600'
            }`}
          >
            {item.acceptanceStatus === 'akzeptiert' ? (
              <Check className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            Akzeptanz: {item.acceptanceStatus}
          </span>
        </div>
      )}

      {/* Progress */}
      {item.progress !== undefined && item.status !== 'geplant' && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Fortschritt</span>
            <span>{item.progress}%</span>
          </div>
          <div className="h-1 w-full rounded-full bg-gray-100">
            <div
              className="h-1 rounded-full bg-primary-500"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        {item.targetDate && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(item.targetDate).toLocaleDateString('de-DE')}
          </span>
        )}
        {item.priority && (
          <span
            className={`px-1.5 py-0.5 rounded text-xs ${
              item.priority === 'hoch'
                ? 'bg-red-50 text-red-600'
                : item.priority === 'mittel'
                  ? 'bg-yellow-50 text-yellow-600'
                  : 'bg-gray-50 text-gray-600'
            }`}
          >
            {item.priority}
          </span>
        )}
      </div>

      {/* Assignee Badge */}
      {assignee && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-[10px] font-medium text-primary-700">
              {assignee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-xs text-gray-500">{assignee.name}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function KanbanColumn({
  status,
  items,
  teamMembers,
  onAssigneeChange,
  onItemClick,
  showMaintenancePoints,
}: {
  status: ModuleStatus
  items: Module[]
  teamMembers: TeamMember[]
  onAssigneeChange: (itemId: string, assigneeId: string | null) => void
  onItemClick?: (item: Module) => void
  showMaintenancePoints?: boolean
}) {
  const config = statusConfig[status]

  return (
    <div className="flex flex-col">
      <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${config.columnColor}`}>
        <span className="font-medium text-gray-700">{config.label}</span>
        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">
          {items.length}
        </span>
      </div>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 min-h-[200px]" data-status={status}>
          {items.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              teamMembers={teamMembers}
              onAssigneeChange={onAssigneeChange}
              onItemClick={onItemClick}
              showMaintenancePoints={showMaintenancePoints}
            />
          ))}
          {items.length === 0 && (
            <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400">
              Keine Projekte
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export function KanbanBoard({ items, teamMembers, onStatusChange, onAssigneeChange, onItemClick, showMaintenancePoints }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [localItems, setLocalItems] = useState(items)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const activeItem = activeId ? localItems.find(i => i.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeItem = localItems.find(i => i.id === active.id)
    if (!activeItem) return

    // Find the target column
    let targetStatus: ModuleStatus | null = null

    // Check if dropped over another item
    const overItem = localItems.find(i => i.id === over.id)
    if (overItem) {
      targetStatus = overItem.status as ModuleStatus
    } else {
      // Check if dropped in an empty column by looking at the droppable id
      const overId = over.id as string
      if (statuses.includes(overId as ModuleStatus)) {
        targetStatus = overId as ModuleStatus
      }
    }

    if (targetStatus && targetStatus !== activeItem.status) {
      // Update local state
      setLocalItems(prev =>
        prev.map(item =>
          item.id === active.id ? { ...item, status: targetStatus! } : item
        )
      )
      // Notify parent
      onStatusChange(active.id as string, targetStatus)
    }
  }

  // Group items by status
  const columns = statuses.reduce((acc, status) => {
    acc[status] = localItems.filter(item => item.status === status)
    return acc
  }, {} as Record<ModuleStatus, Module[]>)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-4 gap-4">
        {statuses.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            items={columns[status]}
            teamMembers={teamMembers}
            onAssigneeChange={onAssigneeChange}
            onItemClick={onItemClick}
            showMaintenancePoints={showMaintenancePoints}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-lg opacity-90">
            <h4 className="font-medium text-gray-900 text-sm">{activeItem.name}</h4>
            <p className="text-xs text-gray-500 mt-1">{activeItem.description}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
