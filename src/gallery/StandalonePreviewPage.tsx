import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { getEntry } from './data'
import { PreviewErrorBoundary } from './PreviewErrorBoundary'

export function StandalonePreviewPage() {
  const params = useParams()
  const slug = params['*'] ?? ''
  const entry = getEntry(slug)
  const [previewKey, setPreviewKey] = useState(0)

  useEffect(() => {
    if (entry) {
      document.title = `${entry.title} - Preview`
    }
  }, [entry])

  if (!entry) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Component not found
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          The requested component "{slug}" could not be located.
        </p>
        <Link
          to="/"
          className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Return to gallery
        </Link>
      </div>
    )
  }

  const { Component } = entry

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Floating control pill in corner */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-zinc-900/80 px-3 py-1.5 shadow-2xl backdrop-blur-md transition-opacity duration-200 opacity-40 hover:opacity-100 dark:border-zinc-700/60 dark:bg-zinc-950/80">
        <Link
          to={`/c/${entry.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-200 hover:text-white"
          title="Back to component details"
        >
          <ArrowLeft className="size-3.5" />
          <span>Exit</span>
        </Link>
        <span className="h-3 w-px bg-white/20" />
        <button
          type="button"
          onClick={() => setPreviewKey((k) => k + 1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-200 hover:text-white"
          title="Reload preview"
        >
          <RotateCcw className="size-3.5" />
          <span>Reload</span>
        </button>
      </div>

      <PreviewErrorBoundary key={previewKey}>
        <div className="w-full min-h-screen">
          <Component />
        </div>
      </PreviewErrorBoundary>
    </div>
  )
}
