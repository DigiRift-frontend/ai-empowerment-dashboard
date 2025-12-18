'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-4">Ein Fehler ist aufgetreten</h2>
          <button
            onClick={() => reset()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  )
}
