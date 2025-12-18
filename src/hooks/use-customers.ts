'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useCustomers() {
  const { data, error, isLoading, mutate } = useSWR('/api/customers', fetcher)

  return {
    customers: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useCustomer(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/customers/${id}` : null,
    fetcher
  )

  return {
    customer: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export async function createCustomer(data: {
  name: string
  companyName: string
  email: string
  advisorId: string
  tier?: string
  monthlyPoints?: number
}) {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create customer')
  return response.json()
}

export async function updateCustomer(id: string, data: Partial<{
  name: string
  companyName: string
  email: string
  advisorId: string
}>) {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update customer')
  return response.json()
}

export async function deleteCustomer(id: string) {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete customer')
  return response.json()
}

export async function updateMembership(customerId: string, data: {
  tier?: string
  monthlyPoints?: number
  monthlyPrice?: number
  discountPercent?: number
  bonusPoints?: number
  usedPoints?: number
  remainingPoints?: number
  contractStart?: string
  contractEnd?: string
  periodStart?: string
  periodEnd?: string
}) {
  const response = await fetch(`/api/customers/${customerId}/membership`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update membership')
  return response.json()
}
