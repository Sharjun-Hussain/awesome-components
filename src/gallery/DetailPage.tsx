import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cn } from '../lib/cn'
import { CodeBlock } from './CodeBlock'
import { getEntry, getNeighbours, type GalleryEntry } from './data'
import { PreviewErrorBoundary } from './PreviewErrorBoundary'

function DetailView({ entry }: { entry: GalleryEntry }) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview')
  const [previewKey, setPreviewKey] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { previous, next } = getNeighbours(entry.slug)
  const { Component } = entry

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFullscreen])
  const importName = entry.name
    .split('/')
    .pop()!
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  const copySource = async () => {
    try {
      await navigator.clipboard.writeText(entry.source)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div
      className={cn(
        'mx-auto w-full px-5 py-8 sm:px-8 md:py-12',
        entry.fullWidth ? 'max-w-7xl' : 'max-w-5xl',
      )}
    >
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-400">
        <Link to="/" className="transition hover:text-zinc-700 dark:hover:text-zinc-200">
          Components
        </Link>
        <ChevronRight className="size-3" />
        <Link
          to={`/?q=${encodeURIComponent(entry.categoryLabel)}`}
          className="transition hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          {entry.categoryLabel}
        </Link>
        <ChevronRight className="size-3" />
        <span className="font-medium text-zinc-700 dark:text-zinc-200">{entry.title}</span>
      </nav>

      <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
              <Layers className="size-3" />
              {entry.categoryLabel}
            </span>
            <span className="font-mono text-[11px] text-zinc-400">{entry.filePath}</span>
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            {entry.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {entry.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to={`/preview/${entry.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            title="Open standalone preview in new tab"
          >
            <ExternalLink className="size-3.5" />
            <span className="hidden sm:inline">Open in new tab</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            title="Fullscreen preview"
          >
            <Maximize2 className="size-3.5" /> Fullscreen
          </button>

          <button
            type="button"
            onClick={copySource}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-500" /> Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" /> Copy code
              </>
            )}
          </button>
        </div>
      </header>

      <div
        className={cn(
          'mt-8 rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50',
          // Tall scroll-driven demos need `position: sticky` to reach the
          // viewport, so their preview card cannot clip on an ancestor.
          !entry.fullWidth && 'overflow-hidden',
        )}
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200/80 px-3 py-2.5 dark:border-zinc-800/80">
          <div className="flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800/80">
            <button
              type="button"
              onClick={() => setTab('preview')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition',
                tab === 'preview'
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
              )}
            >
              <Eye className="size-3.5" />
              Preview
            </button>
            <button
              type="button"
              onClick={() => setTab('code')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition',
                tab === 'code'
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
              )}
            >
              <Code2 className="size-3.5" />
              Code
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-600 sm:inline dark:text-emerald-400">
              Live
            </span>
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[11px] font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              title="Expand preview fullscreen"
            >
              <Maximize2 className="size-3" />
              Fullscreen
            </button>
            <button
              type="button"
              onClick={() => setPreviewKey((key) => key + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[11px] font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <RotateCcw className="size-3" />
              Reload
            </button>
          </div>
        </div>

        {tab === 'preview' ? (
          <div
            className={cn(
              'dot-grid min-h-[440px]',
              entry.fullWidth ? 'p-0' : 'p-6 sm:p-10',
              // Keep the inline preview mounted (so its state survives), but stop
              // it painting behind the fullscreen copy. Fixed-position children
              // with a high z-index would otherwise leak over the modal.
              isFullscreen && 'hidden',
            )}
          >
            <PreviewErrorBoundary key={previewKey}>
              <div className="flex min-h-[360px] items-center justify-center">
                <div className={cn('w-full', entry.fullWidth ? 'max-w-none' : 'max-w-2xl')}>
                  <Component />
                </div>
              </div>
            </PreviewErrorBoundary>
          </div>
        ) : (
          <div className="p-3 sm:p-4">
            <CodeBlock code={entry.source} fileName={entry.filePath} />
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200/80 bg-white/60 px-4 py-3 text-xs leading-5 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
        <span className="font-medium text-zinc-700 dark:text-zinc-200">Usage:</span> import it
        with{' '}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-violet-600 dark:bg-zinc-800 dark:text-violet-300">
          import {importName} from './components/{entry.slug}'
        </code>
      </div>

      <nav className="mt-10 grid gap-3 sm:grid-cols-2">
        {previous ? (
          <Link
            to={`/c/${previous.slug}`}
            className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-violet-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-violet-500/40"
          >
            <ArrowLeft className="size-4 text-zinc-400 transition group-hover:-translate-x-0.5 group-hover:text-violet-500" />
            <span className="min-w-0">
              <span className="block text-[10px] tracking-widest text-zinc-400 uppercase">
                Previous
              </span>
              <span className="block truncate text-sm font-medium text-zinc-900 dark:text-white">
                {previous.title}
              </span>
            </span>
          </Link>
        ) : (
          <span />
        )}

        {next && (
          <Link
            to={`/c/${next.slug}`}
            className="group flex items-center justify-end gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-right transition hover:border-violet-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-violet-500/40"
          >
            <span className="min-w-0">
              <span className="block text-[10px] tracking-widest text-zinc-400 uppercase">
                Next
              </span>
              <span className="block truncate text-sm font-medium text-zinc-900 dark:text-white">
                {next.title}
              </span>
            </span>
            <ArrowRight className="size-4 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-violet-500" />
          </Link>
        )}
      </nav>

      {/* Fullscreen Overlay Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-zinc-950">
          {/* Top Bar */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                {entry.title}
              </span>
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                {entry.categoryLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewKey((k) => k + 1)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                title="Reload preview"
              >
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">Reload</span>
              </button>

              <Link
                to={`/preview/${entry.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                title="Open in new tab"
              >
                <ExternalLink className="size-3.5" />
                <span className="hidden sm:inline">New tab</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-zinc-900 px-3 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                title="Exit fullscreen (Esc)"
              >
                <Minimize2 className="size-3.5" />
                <span>Exit Fullscreen</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Body */}
          <div className="relative flex-1 overflow-auto dot-grid">
            <PreviewErrorBoundary key={previewKey}>
              <div
                className={cn(
                  'w-full min-h-full flex items-center justify-center',
                  entry.fullWidth ? 'p-0' : 'p-6 sm:p-12',
                )}
              >
                <div className={cn('w-full', entry.fullWidth ? 'max-w-none' : 'max-w-4xl')}>
                  <Component />
                </div>
              </div>
            </PreviewErrorBoundary>
          </div>
        </div>
      )}
    </div>
  )
}

export function DetailPage() {
  const { '*': slug = '' } = useParams()
  const entry = getEntry(slug)

  if (!entry) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center">
        <p className="font-mono text-xs tracking-widest text-zinc-400 uppercase">404</p>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-white">
          Component not found
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          <span className="font-mono text-xs">{slug || '(empty)'}</span> doesn’t exist in the
          library.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Back to library
        </Link>
      </div>
    )
  }

  return <DetailView key={entry.slug} entry={entry} />
}
