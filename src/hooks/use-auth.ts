'use client'

import { useRouter } from 'next/navigation'
import useSWR from 'swr'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (res.status === 401) {
    return { authenticated: false }
  }
  if (!res.ok) throw new Error('Failed to fetch session')
  return res.json()
}

export function useAuth() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR('/api/auth/session', fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      mutate({ authenticated: false }, false)
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return {
    customer: data?.customer || null,
    customerId: data?.customer?.id || null,
    isAuthenticated: data?.authenticated || false,
    isLoading,
    isError: error,
    logout,
    mutate,
  }
}
