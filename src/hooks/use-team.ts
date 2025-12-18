'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useTeam() {
  const { data, error, isLoading, mutate } = useSWR('/api/team', fetcher)

  return {
    team: data || [],
    teamMembers: data || [], // Alias for backwards compatibility
    isLoading,
    isError: error,
    mutate,
  }
}

export async function createTeamMember(data: {
  name: string
  role: string
  department: string
  email?: string
}) {
  const response = await fetch('/api/team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create team member')
  return response.json()
}
