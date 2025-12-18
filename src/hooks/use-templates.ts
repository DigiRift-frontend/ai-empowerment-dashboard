'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useTemplates() {
  const { data, error, isLoading, mutate } = useSWR('/api/templates', fetcher)

  return {
    templates: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export async function createTemplate(data: {
  name: string
  description: string
  category: string
  estimatedPoints: number
  estimatedMaintenancePoints: number
  features: string[]
}) {
  const response = await fetch('/api/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create template')
  return response.json()
}
