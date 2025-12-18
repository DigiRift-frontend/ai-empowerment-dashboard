'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-xl font-semibold mb-4">Ein Fehler ist aufgetreten</h2>
      <button
        onClick={() => reset()}
        className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
      >
        Erneut versuchen
      </button>
    </div>
  )
}
