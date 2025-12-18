'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useModules(customerId?: string) {
  const url = customerId ? `/api/modules?customerId=${customerId}` : '/api/modules'
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)

  return {
    modules: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useModule(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/modules/${id}` : null,
    fetcher
  )

  return {
    module: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export async function createModule(data: {
  name: string
  description: string
  customerId: string
  status?: string
  priority?: string
  monthlyMaintenancePoints?: number
  assigneeId?: string
  targetDate?: string
  showInRoadmap?: boolean
}) {
  const response = await fetch('/api/modules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create module')
  return response.json()
}

export async function updateModule(id: string, data: Partial<{
  name: string
  description: string
  status: string
  priority: string
  progress: number
  monthlyMaintenancePoints: number
  softwareUrl: string
  assigneeId: string | null
  targetDate: string | null
  completedDate: string | null
  showInRoadmap: boolean
  roadmapOrder: number
  acceptanceStatus: string
  acceptedAt: string
  acceptedBy: string
}>) {
  const response = await fetch(`/api/modules/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update module')
  return response.json()
}

export async function deleteModule(id: string) {
  const response = await fetch(`/api/modules/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete module')
  return response.json()
}

// Acceptance Criteria
export async function updateAcceptanceCriterion(moduleId: string, criterionId: string, accepted: boolean) {
  const response = await fetch(`/api/modules/${moduleId}/acceptance`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ criterionId, accepted }),
  })
  if (!response.ok) throw new Error('Failed to update criterion')
  return response.json()
}

export async function acceptAllCriteria(moduleId: string, acceptedBy: string) {
  const response = await fetch(`/api/modules/${moduleId}/acceptance`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ acceptAll: true, acceptedBy }),
  })
  if (!response.ok) throw new Error('Failed to accept all criteria')
  return response.json()
}

// Test Feedback
export async function addTestFeedback(moduleId: string, feedback: string) {
  const response = await fetch(`/api/modules/${moduleId}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedback }),
  })
  if (!response.ok) throw new Error('Failed to add feedback')
  return response.json()
}

export async function resolveTestFeedback(moduleId: string, feedbackId: string, resolved: boolean) {
  const response = await fetch(`/api/modules/${moduleId}/feedback`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedbackId, resolved }),
  })
  if (!response.ok) throw new Error('Failed to resolve feedback')
  return response.json()
}
