'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useSchulungen() {
  const { data, error, isLoading, mutate } = useSWR('/api/schulungen', fetcher)

  return {
    schulungen: data?.schulungen || [],
    serien: data?.serien || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useCustomerSchulungen(customerId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    customerId ? `/api/customers/${customerId}/schulungen` : null,
    fetcher
  )

  return {
    assignments: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export async function createSchulung(data: {
  title: string
  description: string
  duration: string
  points: number
  category: string
  isCustom?: boolean
}) {
  const response = await fetch('/api/schulungen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create schulung')
  return response.json()
}

export async function createSerie(data: {
  title: string
  description: string
  schulungIds: string[]
}) {
  const response = await fetch('/api/schulungen/serien', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create serie')
  return response.json()
}

export async function assignSchulungToCustomer(customerId: string, data: {
  schulungId?: string
  serieId?: string
  scheduledDate?: string
}) {
  const response = await fetch(`/api/customers/${customerId}/schulungen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to assign schulung')
  return response.json()
}
