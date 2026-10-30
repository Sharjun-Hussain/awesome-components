import { ArrowRight, Search, Sparkles, X } from 'lucide-react'
import type { ComponentType } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { cn } from '../lib/cn'
import { allEntries, categories } from './data'
import { PreviewErrorBoundary } from './PreviewErrorBoundary'

function Thumbnail({ slug }: { slug: string }) {
  const entry = allEntries.find((item) => item.slug === slug)
  if (!entry) return null
  const { Component, fullWidth, thumbnail } = entry
  const Preview = Component as ComponentType<{ thumbnail?: boolean }>

  return (
    <div className="gallery-preview pointer-events-none flex h-44 items-center justify-center overflow-hidden p-6">
      <div
        className={cn(
          'origin-center transition-transform duration-500',
          fullWidth
            ? 'w-[560px] scale-[0.6] group-hover:scale-[0.63]'
            : 'w-[320px] max-w-full scale-90 group-hover:scale-95',
        )}
      >
        <PreviewErrorBoundary>
          <Preview thumbnail={thumbnail} />
        </PreviewErrorBoundary>
      </div>
    </div>
  )
}

export function HomePage() {
  const [params, setParams] = useSearchParams()
  const query = (params.get('q') ?? '').trim()
  const lower = query.toLowerCase()

  const filtered = categories
    .map((category) => ({
      ...category,
      entries: lower
        ? category.entries.filter((entry) =>
            `${entry.title} ${entry.description} ${entry.categoryLabel}`
              .toLowerCase()
              .includes(lower),
          )
        : category.entries,
    }))
    .filter((category) => category.entries.length > 0)

  const resultCount = filtered.reduce((total, category) => total + category.entries.length, 0)

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 md:py-12">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white px-6 py-10 sm:px-10 sm:py-14 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="pointer-events-none absolute -top-32 -right-24 size-80 rounded-full bg-gradient-to-br from-violet-400/30 via-fuchsia-400/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 size-80 rounded-full bg-gradient-to-tr from-sky-400/20 via-cyan-300/10 to-transparent blur-3xl" />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-700 uppercase dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
            <Sparkles className="size-3.5" />
            Component library
          </span>

          <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-balance text-zinc-900 sm:text-5xl dark:text-white">
            Build with{' '}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">
              awesome components
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-500 sm:text-base dark:text-zinc-400">
            A growing collection of hand-picked React components, grouped by
            category. Every demo is live — open one to preview it and copy the
            source.
          </p>

          <div className="mt-8 flex max-w-md items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  const value = event.target.value
                  setParams(value ? { q: value } : {}, { replace: true })
                }}
                placeholder="Search the library…"
                aria-label="Search the library"
                className="h-12 w-full rounded-xl border border-zinc-200 bg-white/80 pr-10 pl-11 text-sm outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-700 dark:bg-zinc-950/60"
              />
              {query && (
                <Link
                  to="/"
                  aria-label="Clear search"
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="size-4" />
                </Link>
              )}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              <strong className="font-semibold text-zinc-900 dark:text-white">
                {allEntries.length}
              </strong>{' '}
              components
            </span>
            <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span>
              <strong className="font-semibold text-zinc-900 dark:text-white">
                {categories.length}
              </strong>{' '}
              groups
            </span>
            <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Live previews
            </span>
          </div>
        </div>
      </section>

      {query && (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Showing <span className="font-medium text-zinc-900 dark:text-white">{resultCount}</span>{' '}
          result{resultCount === 1 ? '' : 's'} for “{query}”
        </p>
      )}

      <div className={query ? 'mt-5 space-y-12' : 'mt-12 space-y-12'}>
        {filtered.map((category) => (
          <section key={category.id} id={category.id} className="scroll-mt-20">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                  <category.icon className="size-4" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                    {category.label}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {category.entries.length} component
                    {category.entries.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {category.entries.map((entry) => (
                <div
                  key={entry.slug}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/10 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-violet-500/40"
                >
                  <div className="relative border-b border-zinc-100 bg-gradient-to-b from-zinc-50 to-white dark:border-zinc-800/80 dark:from-zinc-950/40 dark:to-zinc-900/10">
                    <Thumbnail slug={entry.slug} />
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/80 to-transparent dark:from-zinc-900/80" />
                  </div>

                  <div className="flex items-start gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                        {entry.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                        {entry.description}
                      </p>
                    </div>
                    <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full border border-zinc-200 text-zinc-400 transition group-hover:border-violet-300 group-hover:bg-violet-50 group-hover:text-violet-600 dark:border-zinc-700 dark:group-hover:border-violet-500/40 dark:group-hover:bg-violet-500/10 dark:group-hover:text-violet-300">
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>

                  <Link
                    to={`/c/${entry.slug}`}
                    aria-label={`Open ${entry.title}`}
                    className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 rounded-2xl border border-dashed border-zinc-300 px-6 py-16 text-center dark:border-zinc-700">
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            Nothing found for “{query}”
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Try a different name, or clear the search to see everything.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Clear search
          </Link>
        </div>
      )}

      <footer className="mt-20 border-t border-zinc-200 py-6 text-center text-xs text-zinc-400 dark:border-zinc-800">
        Drop new files in{' '}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          src/components/&lt;group&gt;/
        </code>{' '}
        and they appear here automatically.
      </footer>
    </div>
  )
}
