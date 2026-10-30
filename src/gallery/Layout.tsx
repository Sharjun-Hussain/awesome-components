import {
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { cn } from '../lib/cn'
import { allEntries, categories } from './data'
import { useTheme } from './useTheme'

function SearchField({ className }: { className?: string }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const query = params.get('q') ?? ''

  const update = (value: string) => {
    const next = value ? `/?q=${encodeURIComponent(value)}` : '/'
    navigate(next, { replace: location.pathname === '/' })
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        value={query}
        onChange={(event) => update(event.target.value)}
        placeholder="Search components…"
        aria-label="Search components"
        data-gallery-search
        className="h-10 w-full rounded-xl border border-zinc-200 bg-white/70 pr-8 pl-9 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100"
      />
      {query ? (
        <button
          type="button"
          onClick={() => update('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <X className="size-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-zinc-200 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 sm:block dark:border-zinc-700">
          /
        </kbd>
      )}
    </div>
  )
}

export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [params] = useSearchParams()
  const query = (params.get('q') ?? '').toLowerCase()
  const { theme, toggle } = useTheme()
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable

      if (event.key === '/' && !typing) {
        event.preventDefault()
        if (!window.matchMedia('(min-width: 1024px)').matches) {
          setDrawerOpen(true)
        }
        requestAnimationFrame(() =>
          document.querySelector<HTMLInputElement>('[data-gallery-search]')?.focus(),
        )
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const visibleCategories = categories
    .map((category) => ({
      ...category,
      entries: query
        ? category.entries.filter((entry) =>
            `${entry.title} ${entry.description} ${entry.categoryLabel}`
              .toLowerCase()
              .includes(query),
          )
        : category.entries,
    }))
    .filter((category) => category.entries.length > 0)

  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[286px_minmax(0,1fr)]">
      {drawerOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col border-r border-zinc-200 bg-white/95 backdrop-blur transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 dark:border-zinc-800/80 dark:bg-zinc-950/95',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-zinc-200/80 px-5 dark:border-zinc-800/80">
          <Link to="/" className="group flex items-center gap-2.5" onClick={() => setDrawerOpen(false)}>
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 transition-transform group-hover:scale-105">
              <Sparkles className="size-4.5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                Lusion
              </span>
              <span className="block text-[11px] font-medium tracking-widest text-zinc-400 uppercase">
                UI Library
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 lg:hidden dark:hover:bg-zinc-800"
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="shrink-0 px-4 py-4">
          <SearchField />
        </div>

        <nav
          className="flex-1 overflow-y-auto px-3 pb-6"
          onClick={() => setDrawerOpen(false)}
        >
          <p className="px-2 pb-2 text-[11px] font-semibold tracking-widest text-zinc-400 uppercase">
            {query ? 'Results' : 'Library'}
          </p>

          {visibleCategories.map((category) => (
            <div key={category.id} className="mb-4">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <category.icon className="size-3.5 text-zinc-400" />
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  {category.label}
                </span>
                <span className="ml-auto rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-400">
                  {category.entries.length}
                </span>
              </div>

              <div className="mt-1 space-y-0.5">
                {category.entries.map((entry) => (
                  <NavLink
                    key={entry.slug}
                    to={`/c/${entry.slug}`}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition',
                        isActive
                          ? 'bg-violet-50 font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100',
                      )
                    }
                  >
                    <span
                      className={cn(
                        'size-1 rounded-full transition',
                        'bg-zinc-300 group-hover:bg-violet-500 dark:bg-zinc-700',
                      )}
                    />
                    <span className="truncate">{entry.title}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {visibleCategories.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-zinc-400">
              No components match “{params.get('q')}”.
            </p>
          )}
        </nav>

        <div className="shrink-0 border-t border-zinc-200/80 p-4 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">
              {allEntries.length} component{allEntries.length === 1 ? '' : 's'} ·{' '}
              {categories.length} group{categories.length === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle theme"
              className="grid size-8 place-items-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              {theme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-zinc-200/80 bg-zinc-50/85 px-4 backdrop-blur-xl lg:hidden dark:border-zinc-800/80 dark:bg-zinc-950/85">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            className="grid size-9 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <Menu className="size-4" />
          </button>
          <Link to="/" className="text-sm font-semibold text-zinc-900 dark:text-white">
            Lusion UI
          </Link>
          <span className="ml-auto rounded-full bg-violet-500/10 px-2 py-1 text-[11px] font-medium text-violet-600 dark:text-violet-300">
            {allEntries.length} demos
          </span>
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid size-9 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
