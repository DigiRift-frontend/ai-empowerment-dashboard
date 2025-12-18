'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useAdvisors() {
  const { data, error, isLoading, mutate } = useSWR('/api/advisors', fetcher)

  return {
    advisors: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export async function createAdvisor(data: {
  name: string
  role: string
  email: string
  phone: string
  avatarUrl?: string
  calendlyUrl?: string
}) {
  const response = await fetch('/api/advisors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create advisor')
  return response.json()
}

export async function updateAdvisor(id: string, data: {
  name?: string
  role?: string
  email?: string
  phone?: string
  avatarUrl?: string
  calendlyUrl?: string
}) {
  const response = await fetch(`/api/advisors/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update advisor')
  return response.json()
}

export async function deleteAdvisor(id: string) {
  const response = await fetch(`/api/advisors/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete advisor')
  return response.json()
}

export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', 'avatar')

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) throw new Error('Failed to upload image')
  const data = await response.json()
  return data.url
}
